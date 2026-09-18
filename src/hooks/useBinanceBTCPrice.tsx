import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useNotifications from "./useNotifications";

type BinanceTrade = {
  p: string;
};

type WebSocketStatus = "connecting" | "connected" | "disconnected";

type AlarmDirection = "above" | "below";

export type PriceAlarm = {
  id: number;
  symbol: string;
  target: number;
  direction: AlarmDirection;
  triggered: boolean;
  triggeredPrice?: number;
  triggeredAt?: string;
  createdAt: string;
};

type AlarmSettings = {
  sound: boolean;
  notifications: boolean;
};

const STORAGE_KEY = "@binance_price_alarms";

const SETTINGS_KEY = "@binance_price_alarm_settings";

const DEFAULT_SETTINGS: AlarmSettings = {
  sound: true,
  notifications: true,
};

const useBinancePriceAlarm = (initialSymbol = "BTCUSDT") => {
  const { sendNotification, permissionGranted, requestPermissions } =
    useNotifications();

  const [symbol, setSymbol] = useState(initialSymbol);

  const [price, setPrice] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<WebSocketStatus>("connecting");

  const [activeAlarms, setActiveAlarms] = useState<PriceAlarm[]>([]);

  const [pastAlarms, setPastAlarms] = useState<PriceAlarm[]>([]);

  const [settings, setSettings] = useState<AlarmSettings>(DEFAULT_SETTINGS);

  const socketRef = useRef<WebSocket | null>(null);

  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const checkAlarmsRef = useRef<
    (price: number, symbol: string) => Promise<void>
  >(async () => {});

  const reconnectAttemptsRef = useRef(0);

  const mountedRef = useRef(true);

  const alarmsRef = useRef<PriceAlarm[]>([]);

  const settingsRef = useRef<AlarmSettings>(DEFAULT_SETTINGS);

  const lastTriggeredRef = useRef<Set<number>>(new Set());

  const symbolRef = useRef(initialSymbol);

  const priceRef = useRef<number | null>(null);

  const nextIdRef = useRef(1);

  const updateAlarms = useCallback((nextAlarms: PriceAlarm[]) => {
    alarmsRef.current = nextAlarms;

    setActiveAlarms(nextAlarms.filter((alarm) => !alarm.triggered));

    setPastAlarms(nextAlarms.filter((alarm) => alarm.triggered));

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextAlarms)).catch(
      (error) => {
        console.error("Failed to save alarms:", error);
      },
    );
  }, []);

  const loadStoredData = useCallback(async () => {
    try {
      const [storedAlarms, storedSettings] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
      ]);

      if (storedAlarms) {
        const parsed: PriceAlarm[] = JSON.parse(storedAlarms);

        const validAlarms = Array.isArray(parsed) ? parsed : [];

        alarmsRef.current = validAlarms;

        setActiveAlarms(validAlarms.filter((alarm) => !alarm.triggered));

        setPastAlarms(validAlarms.filter((alarm) => alarm.triggered));

        const maxId = validAlarms.reduce(
          (max, alarm) => Math.max(max, alarm.id),
          0,
        );

        nextIdRef.current = maxId + 1;
      }

      if (storedSettings) {
        const parsedSettings: AlarmSettings = JSON.parse(storedSettings);

        const mergedSettings = {
          ...DEFAULT_SETTINGS,
          ...parsedSettings,
        };

        settingsRef.current = mergedSettings;

        setSettings(mergedSettings);
      }
    } catch (error) {
      console.error("Failed to load alarm data:", error);
    }
  }, []);

  const connectToSymbol = useCallback((nextSymbol: string) => {
    const normalizedSymbol = nextSymbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      return;
    }

    symbolRef.current = normalizedSymbol;

    setSymbol(normalizedSymbol);

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectAttemptsRef.current = 0;

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

        console.log("Connected to Binance:", streamSymbol);
      };

      ws.onmessage = (event) => {
        try {
          const trade: BinanceTrade = JSON.parse(event.data);

          const currentPrice = Number(trade.p);

          if (!Number.isFinite(currentPrice)) {
            return;
          }

          if (!mountedRef.current) {
            return;
          }

          priceRef.current = currentPrice;

          setPrice(currentPrice);

          checkAlarmsRef.current(currentPrice, symbolRef.current);
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

  const checkAlarms = useCallback(
    async (currentPrice: number, currentSymbol: string) => {
      const alarms = alarmsRef.current;

      const currentSettings = settingsRef.current;

      const active = alarms.filter(
        (alarm) => !alarm.triggered && alarm.symbol === currentSymbol,
      );

      for (const alarm of active) {
        const shouldTrigger =
          alarm.direction === "above"
            ? currentPrice >= alarm.target
            : currentPrice <= alarm.target;

        if (!shouldTrigger) {
          continue;
        }

        if (lastTriggeredRef.current.has(alarm.id)) {
          continue;
        }

        lastTriggeredRef.current.add(alarm.id);

        const triggeredAlarm: PriceAlarm = {
          ...alarm,
          triggered: true,
          triggeredPrice: currentPrice,
          triggeredAt: new Date().toISOString(),
        };

        const updatedAlarms = alarmsRef.current.map((item) =>
          item.id === alarm.id ? triggeredAlarm : item,
        );

        updateAlarms(updatedAlarms);

        console.log("Price alarm triggered:", triggeredAlarm);

        if (currentSettings.notifications) {
          try {
            await sendNotification({
              title: `${alarm.symbol} Price Alert`,
              body: `${alarm.symbol} reached ${currentPrice.toLocaleString()}. Target: ${alarm.target.toLocaleString()}.`,
              data: {
                alarmId: alarm.id,
                symbol: alarm.symbol,
                target: alarm.target,
                direction: alarm.direction,
              },
              sound: "alarm1.mp3",
            });
          } catch (error) {
            console.error("Failed to send price notification:", error);
          }
        }
      }
    },
    [sendNotification, updateAlarms],
  );

  checkAlarmsRef.current = checkAlarms;

  const createAlarm = useCallback(
    async (alarmSymbol: string, target: number, direction: string) => {
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

      const newAlarm: PriceAlarm = {
        id: nextIdRef.current++,
        symbol: normalizedSymbol,
        target: normalizedTarget,
        direction: direction as AlarmDirection,
        triggered: false,
        createdAt: new Date().toISOString(),
      };

      updateAlarms([...alarmsRef.current, newAlarm]);

      if (normalizedSymbol !== symbolRef.current) {
        connectToSymbol(normalizedSymbol);
      }

      return newAlarm;
    },
    [connectToSymbol, updateAlarms],
  );

  const deleteAlarm = useCallback(
    async (alarmId: number) => {
      lastTriggeredRef.current.delete(alarmId);

      updateAlarms(alarmsRef.current.filter((alarm) => alarm.id !== alarmId));
    },
    [updateAlarms],
  );

  const setSoundEnabled = useCallback(async (enabled: boolean) => {
    const nextSettings = {
      ...settingsRef.current,
      sound: enabled,
    };

    settingsRef.current = nextSettings;

    setSettings(nextSettings);

    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
  }, []);

  const setNotificationsEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled && !permissionGranted) {
        const granted = await requestPermissions();

        if (!granted) {
          return;
        }
      }

      const nextSettings = {
        ...settingsRef.current,
        notifications: enabled,
      };

      settingsRef.current = nextSettings;

      setSettings(nextSettings);

      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
    },
    [permissionGranted, requestPermissions],
  );

  useEffect(() => {
    mountedRef.current = true;

    const initialize = async () => {
      await loadStoredData();

      if (mountedRef.current) {
        setLoading(false);
      }

      connectToSymbol(initialSymbol);
    };

    initialize();

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
  }, [initialSymbol, loadStoredData, connectToSymbol]);

  return {
    symbol,
    price,
    loading,
    status,
    activeAlarms,
    pastAlarms,
    createAlarm,
    deleteAlarm,
    connectToSymbol,
    settings,
    setSoundEnabled,
    setNotificationsEnabled,
    permissionGranted,
    requestPermissions,
  };
};

export default useBinancePriceAlarm;
