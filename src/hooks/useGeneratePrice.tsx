import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  setAlarms,
  setNotificationsEnabled,
  setSoundEnabled,
} from "../store/appSlice";
import useNotifications from "./useNotifications";
import createAlarmOnBackend from "../api/createAlarm";
import deleteAlarmFromDb from "../api/deleteAalrm";

type AlarmDirection = "above" | "below";

type BinanceTrade = {
  p: string;
};

export type PriceAlarm = {
  id: number;
  symbol: string;
  targetPrice: number;
  direction: AlarmDirection;
  triggered: boolean;
  triggeredPrice?: number;
  triggeredAt: string;
  createdAt: string;
  futureOrSpot: string;
  initialPrice?: number;
};

export type PriceAlarmWidthoutId = {
  symbol: string;
  targetPrice: number;
  direction: AlarmDirection;
  triggered: boolean;
  triggeredPrice?: number;
  triggeredAt: string;
  createdAt: string;
  futureOrSpot: string;
  initialPrice?: number;
};

const useGeneratePrice = (initialCurreny = "BTCUSDT") => {
  const dispatch = useDispatch();

  const { permissionGranted, requestPermissions, getPushToken } =
    useNotifications();

  const [status, setStatus] = useState("");
  const [price, setPrice] = useState(0);
  const [change24h, setChange24h] = useState<number | null>(null);

  const symbolRef = useRef(initialCurreny);
  const socketRef = useRef<WebSocket | null>(null);

  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const reconnectAttemptsRef = useRef(0);

  const priceRef = useRef<number | null>(null);

  const mountedRef = useRef(true);

  const nextIdRef = useRef(1);

  const alarmLastPriceRef = useRef<Map<number, number>>(new Map());

  /**
   * Enable/disable alarm sound.
   */
  const setAlarmSoundNotification = useCallback(
    (enabled: boolean) => {
      if (!permissionGranted) {
        requestPermissions();
      }

      dispatch(setSoundEnabled(enabled));
    },
    [dispatch, permissionGranted, requestPermissions],
  );

  const get24HourChange = useCallback(async (symbol: string) => {
    try {
      const normalizedSymbol = symbol.trim().toUpperCase();

      const response = await fetch(
        `https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${normalizedSymbol}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch 24h change: ${response.status}`);
      }

      const data = await response.json();

      const percentChange = Number(data.priceChangePercent);

      if (!Number.isFinite(percentChange)) {
        setChange24h(null);
        return null;
      }

      setChange24h(percentChange);

      return percentChange;
    } catch (error) {
      console.error("Binance 24h change error:", error);
      setChange24h(null);
      return null;
    }
  }, []);

  /**
   * Enable/disable push notifications.
   */
  const setNotificationSoundNotification = useCallback(
    (enabled: boolean) => {
      if (!permissionGranted) {
        requestPermissions();
      }

      dispatch(setNotificationsEnabled(enabled));
    },
    [dispatch, permissionGranted, requestPermissions],
  );

  /**
   * Delete alarm.
   *
   * The backend already knows the alarm by its ID,
   * so no userId/token is required here.
   */
  const deleteAlarm = useCallback(
    async (alarmId: number) => {
      const res = await deleteAlarmFromDb(alarmId);

      if (res.success) {
        dispatch(setAlarms(res.data));
      }
    },
    [dispatch],
  );

  /**
   * Connect to Binance Futures WebSocket.
   */
  const getPriceBasedOnCurrency = useCallback(
    (nextSymbol: string) => {
      const normalizedSymbol = nextSymbol.trim().toUpperCase();

      if (!normalizedSymbol) {
        return;
      }

      symbolRef.current = normalizedSymbol;

      setChange24h(null);
      get24HourChange(normalizedSymbol);

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);

        reconnectTimeoutRef.current = undefined;
      }

      reconnectAttemptsRef.current = 0;
      priceRef.current = null;

      const connect = () => {
        if (!mountedRef.current) {
          return;
        }

        setStatus("connecting");

        const streamSymbol = symbolRef.current.toLowerCase();

        const ws = new WebSocket(
          `wss://fstream.binance.com/ws/${streamSymbol}@trade`,
        );

        socketRef.current = ws;

        ws.onopen = () => {
          if (!mountedRef.current) {
            return;
          }

          reconnectAttemptsRef.current = 0;

          setStatus("connected");
        };

        ws.onmessage = (event) => {
          try {
            const trade: BinanceTrade = JSON.parse(event.data);

            const currentPrice = Number(trade.p);

            if (!Number.isFinite(currentPrice) || currentPrice === 0) {
              return;
            }

            if (!mountedRef.current) {
              return;
            }

            priceRef.current = currentPrice;

            setPrice(currentPrice);
          } catch (error) {
            console.error("Binance WebSocket parse error:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("Binance WebSocket error:", error);
        };

        ws.onclose = () => {
          if (!mountedRef.current) {
            return;
          }

          setStatus("disconnected");

          const attempt = reconnectAttemptsRef.current++;

          const delay = Math.min(1000 * Math.pow(2, attempt), 30000);

          reconnectTimeoutRef.current = setTimeout(connect, delay);
        };
      };

      connect();
    },
    [get24HourChange],
  );

  /**
   * Create a price alarm.
   *
   * The Expo push token is now the ONLY identity
   * sent to the backend.
   */
  const createAlarm = useCallback(
    async (
      alarmSymbol: string,
      target: number,
      direction: string,
      futureOrSpot: string,
    ) => {
      const normalizedSymbol = alarmSymbol.trim().toUpperCase();

      const normalizedTarget = Number(target);

      if (!normalizedSymbol) {
        throw new Error("Invalid symbol.");
      }

      if (!Number.isFinite(normalizedTarget) || normalizedTarget <= 0) {
        throw new Error("Invalid target price.");
      }

      if (direction !== "above" && direction !== "below") {
        throw new Error("Invalid alarm direction.");
      }

      const pushToken = await getPushToken();

      if (!pushToken) {
        throw new Error("Unable to obtain Expo push token.");
      }

      /**
       * Get the current price only when this is
       * the currently connected symbol.
       */
      const currentPrice =
        normalizedSymbol === symbolRef.current ? priceRef.current : null;

      const initialPrice =
        currentPrice !== null && Number.isFinite(currentPrice)
          ? currentPrice
          : undefined;

      const createdAt = new Date().toISOString();
      const triggeredAt = new Date().toISOString();

      const newAlarm: PriceAlarm = {
        id: nextIdRef.current++,
        symbol: normalizedSymbol,
        targetPrice: normalizedTarget,
        direction: direction as AlarmDirection,
        triggered: false,
        triggeredAt,
        createdAt,
        futureOrSpot,
        initialPrice,
      };

      const alarmToSend: PriceAlarmWidthoutId = {
        symbol: normalizedSymbol,
        targetPrice: normalizedTarget,
        direction: direction as AlarmDirection,
        triggered: false,
        triggeredAt,
        createdAt,
        futureOrSpot,
        initialPrice,
      };

      /**
       * Send the alarm using the push token.
       *
       * Before:
       * createAlarmOnBackend(alarmToSend, userId)
       *
       * Now:
       * createAlarmOnBackend(alarmToSend, pushToken)
       */
      const res = await createAlarmOnBackend(alarmToSend, pushToken);

      if (res.success) {
        dispatch(setAlarms(res.data));
      }

      /**
       * Keep track of the initial price locally.
       */
      if (initialPrice !== undefined) {
        alarmLastPriceRef.current.set(newAlarm.id, initialPrice);
      } else {
        alarmLastPriceRef.current.delete(newAlarm.id);
      }

      /**
       * If the alarm was created for another symbol,
       * switch the Binance WebSocket.
       */
      if (normalizedSymbol !== symbolRef.current) {
        getPriceBasedOnCurrency(normalizedSymbol);
      }

      return newAlarm;
    },
    [dispatch, getPushToken, getPriceBasedOnCurrency],
  );

  /**
   * Initialize Binance WebSocket.
   */
  useEffect(() => {
    mountedRef.current = true;

    getPriceBasedOnCurrency(initialCurreny);

    return () => {
      mountedRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);

        reconnectTimeoutRef.current = undefined;
      }

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [initialCurreny, getPriceBasedOnCurrency]);

  return {
    status,
    price,
    change24h,
    permissionGranted,
    requestPermissions,
    createAlarm,
    deleteAlarm,
    setAlarmSoundNotification,
    setNotificationSoundNotification,
  };
};

export default useGeneratePrice;
