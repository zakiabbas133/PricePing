import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  addNewAlarm,
  deleteSelectedAlarm,
  setNotificationsEnabled,
  setSelectedSound,
  setSoundEnabled,
  // setUserId,
  setVolume,
} from "../store/appSlice";
import { SoundItem } from "../screens/AlarmSounds";
import useNotifications from "./useNotifications";
import createAlarmOnBackend from "../api/createAlarm";

type AlarmDirection = "above" | "below";

type BinanceTrade = {
  p: string;
};

export type PriceAlarm = {
  id: number;
  symbol: string;
  target: number;
  direction: AlarmDirection;
  triggered: boolean;
  triggeredPrice?: number;
  triggeredAt?: string;
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
  triggeredAt?: string;
  createdAt: string;
  futureOrSpot: string;
  initialPrice?: number;
};

const useGeneratePrice = (initialCurreny = "BTCUSDT") => {
  const dispatch = useDispatch();

  const { permissionGranted, requestPermissions, getOrCreateUserId } =
    useNotifications();

  const [status, setStatus] = useState("");
  const [price, setPrice] = useState(0);

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

  const changeAppVolume = useCallback(
    (volume: number) => {
      dispatch(setVolume(volume));
    },
    [dispatch],
  );

  const setAlarmSoundNotification = useCallback(
    (enabled: boolean) => {
      if (!permissionGranted) {
        requestPermissions();
      }

      dispatch(setSoundEnabled(enabled));
    },
    [dispatch, permissionGranted, requestPermissions],
  );

  const setNotificationSoundNotification = useCallback(
    (enabled: boolean) => {
      if (!permissionGranted) {
        requestPermissions();
      }

      dispatch(setNotificationsEnabled(enabled));
    },
    [dispatch, permissionGranted, requestPermissions],
  );

  const setAlarmSound = useCallback(
    (sound: SoundItem) => {
      dispatch(
        setSelectedSound({
          id: sound.id,
          soundName: sound.description,
          fileName: sound.id,
          fileFullName: `${sound.id}.mp3`,
        }),
      );
    },
    [dispatch],
  );

  const deleteAlarm = useCallback(
    async (alarmId: number) => {
      dispatch(deleteSelectedAlarm(alarmId));
    },
    [dispatch],
  );

  const getPriceBasedOnCurrency = useCallback((nextSymbol: string) => {
    const normalizedSymbol = nextSymbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      return;
    }

    symbolRef.current = normalizedSymbol;

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
  }, []);

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

      /*
       * THIS IS THE IMPORTANT FIX.
       *
       * The alarm creation waits until the persistent
       * user ID actually exists.
       */
      const userId = await getOrCreateUserId();

      if (!userId) {
        throw new Error("Unable to obtain device user ID.");
      }

      const currentPrice =
        normalizedSymbol === symbolRef.current ? priceRef.current : null;

      const initialPrice =
        currentPrice !== null && Number.isFinite(currentPrice)
          ? currentPrice
          : undefined;

      const createdAt = new Date().toISOString();

      const newAlarm: PriceAlarm = {
        id: nextIdRef.current++,
        symbol: normalizedSymbol,
        target: normalizedTarget,
        direction: direction as AlarmDirection,
        triggered: false,
        createdAt,
        futureOrSpot,
        initialPrice,
      };

      const alarmToSend: PriceAlarmWidthoutId = {
        symbol: normalizedSymbol,
        targetPrice: normalizedTarget,
        direction: direction as AlarmDirection,
        triggered: false,
        createdAt,
        futureOrSpot,
        initialPrice,
      };

      /*
       * Now userId is guaranteed to exist.
       */
      await createAlarmOnBackend(alarmToSend, userId);

      dispatch(addNewAlarm(newAlarm));

      if (initialPrice !== undefined) {
        alarmLastPriceRef.current.set(newAlarm.id, initialPrice);
      } else {
        alarmLastPriceRef.current.delete(newAlarm.id);
      }

      if (normalizedSymbol !== symbolRef.current) {
        getPriceBasedOnCurrency(normalizedSymbol);
      }

      return newAlarm;
    },
    [dispatch, getOrCreateUserId, getPriceBasedOnCurrency],
  );

  useEffect(() => {
    mountedRef.current = true;

    getPriceBasedOnCurrency(initialCurreny);

    return () => {
      mountedRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
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
    permissionGranted,
    requestPermissions,
    createAlarm,
    deleteAlarm,
    setAlarmSound,
    changeAppVolume,
    setAlarmSoundNotification,
    setNotificationSoundNotification,
  };
};

export default useGeneratePrice;
