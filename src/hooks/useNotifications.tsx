import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { setUserId } from "../store/appSlice";
import ConnectToApi from "../api/connectToApi";
import { RootState } from "../store/store";

const CHANNEL_ALARM_1 = "price-alerts-alarm1";
const CHANNEL_ALARM_2 = "price-alerts-alarm2";

const USER_ID_KEY = "@priceping_user_id";

const SOUND_ALARM_1 = "alarm1.mp3";
const SOUND_ALARM_2 = "alarm2.mp3";

export type NotificationSound = typeof SOUND_ALARM_1 | typeof SOUND_ALARM_2;

type NotificationData = Record<string, unknown>;

export type NotificationPayload = {
  title: string;
  body: string;
  data?: NotificationData;
  sound?: NotificationSound;
};

export type ScheduledNotificationPayload = NotificationPayload & {
  seconds: number;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const getChannelId = (sound: NotificationSound) => {
  return sound === SOUND_ALARM_2 ? CHANNEL_ALARM_2 : CHANNEL_ALARM_1;
};

const generateGUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
};

const useNotifications = () => {
  const dispatch = useDispatch();

  const reduxUserId = useSelector((state: RootState) => state.app.userId);

  const reduxUserIdRef = useRef<string | null>(reduxUserId || null);

  const userIdPromiseRef = useRef<Promise<string | null> | null>(null);

  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    [],
  );

  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  /*
   * Keep the latest Redux userId available without making
   * callbacks depend on userId and recreating constantly.
   */
  useEffect(() => {
    if (reduxUserId) {
      reduxUserIdRef.current = reduxUserId;
    }
  }, [reduxUserId]);

  const requestPermissions = useCallback(async () => {
    try {
      const existing = await Notifications.getPermissionsAsync();

      let status = existing.status;

      if (status !== "granted") {
        const requested = await Notifications.requestPermissionsAsync();

        status = requested.status;
      }

      const granted = status === "granted";

      setPermissionGranted(granted);

      return granted;
    } catch (error) {
      console.error("Notification permission error:", error);

      setPermissionGranted(false);

      return false;
    }
  }, []);

  /*
   * This is the single source of truth for obtaining
   * the device's persistent user ID.
   */
  const getOrCreateUserId = useCallback(async () => {
    /*
     * Already available in memory.
     */
    if (reduxUserIdRef.current) {
      return reduxUserIdRef.current;
    }

    /*
     * If another call is already resolving the user ID,
     * wait for the same promise instead of creating another ID.
     */
    if (userIdPromiseRef.current) {
      return userIdPromiseRef.current;
    }

    const promise = (async () => {
      try {
        /*
         * First check AsyncStorage.
         */
        const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);

        if (storedUserId) {
          reduxUserIdRef.current = storedUserId;

          dispatch(setUserId(storedUserId));

          return storedUserId;
        }

        /*
         * No existing ID. We need notification permission
         * because this ID is associated with the push token.
         */
        const granted = await requestPermissions();

        if (!granted) {
          return null;
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;

        if (!projectId) {
          throw new Error("Expo project ID not found.");
        }

        const tokenResponse = await Notifications.getExpoPushTokenAsync({
          projectId,
        });

        const token = tokenResponse.data;

        /*
         * Double-check in case another async operation
         * created the ID while we were waiting.
         */
        const latestStoredUserId = await AsyncStorage.getItem(USER_ID_KEY);

        if (latestStoredUserId) {
          reduxUserIdRef.current = latestStoredUserId;

          dispatch(setUserId(latestStoredUserId));

          return latestStoredUserId;
        }

        const newUserId = generateGUID();

        const response = await ConnectToApi(
          newUserId,
          token,
          Platform.OS,
          Constants.deviceName || "",
        );

        if (!response?.success) {
          throw new Error("Unable to register push token.");
        }

        /*
         * Persist first.
         */
        await AsyncStorage.setItem(USER_ID_KEY, newUserId);

        /*
         * Then update memory/Redux.
         */
        reduxUserIdRef.current = newUserId;

        dispatch(setUserId(newUserId));

        return newUserId;
      } catch (error) {
        console.error("Get/create user ID error:", error);

        return null;
      } finally {
        userIdPromiseRef.current = null;
      }
    })();

    userIdPromiseRef.current = promise;

    return promise;
  }, [dispatch, requestPermissions]);

  /*
   * Register push token.
   *
   * This now uses the same user-ID mechanism as alarms.
   */
  const registerPushToken = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        return null;
      }

      const userId = await getOrCreateUserId();

      if (!userId) {
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        throw new Error("Expo project ID not found.");
      }

      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return tokenResponse.data;
    } catch (error) {
      console.error("Push token registration error:", error);

      return null;
    }
  }, [getOrCreateUserId]);

  const initializeChannels = useCallback(async () => {
    if (Platform.OS !== "android") {
      return;
    }

    await Notifications.setNotificationChannelAsync(CHANNEL_ALARM_1, {
      name: "Price Alerts - Alarm 1",
      importance: Notifications.AndroidImportance.MAX,
      sound: "alarm1",
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    await Notifications.setNotificationChannelAsync(CHANNEL_ALARM_2, {
      name: "Price Alerts - Alarm 2",
      importance: Notifications.AndroidImportance.MAX,
      sound: "alarm2",
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    const availableChannels =
      await Notifications.getNotificationChannelsAsync();

    setChannels(availableChannels);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await initializeChannels();

        const granted = await requestPermissions();

        if (mounted) {
          setPermissionGranted(granted);
        }

        if (granted) {
          await registerPushToken();
        }
      } catch (error) {
        console.error("Notification initialization error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    const notificationListener = Notifications.addNotificationReceivedListener(
      (receivedNotification) => {
        if (mounted) {
          setNotification(receivedNotification);
        }
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener(() => {
        // Handle notification response if required.
      });

    return () => {
      mounted = false;

      notificationListener.remove();
      responseListener.remove();
    };
  }, [initializeChannels, requestPermissions, registerPushToken]);

  const ensurePermission = useCallback(async () => {
    if (permissionGranted) {
      return true;
    }

    const granted = await requestPermissions();

    if (!granted) {
      throw new Error("Notification permission was not granted.");
    }

    return true;
  }, [permissionGranted, requestPermissions]);

  const sendNotification = useCallback(
    async ({
      title,
      body,
      data = {},
      sound = SOUND_ALARM_1,
    }: NotificationPayload) => {
      await ensurePermission();

      const channelId = getChannelId(sound);

      return Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound,

          ...(Platform.OS === "android" && {
            channelId,
          }),
        },

        trigger: null,
      });
    },
    [ensurePermission],
  );

  const scheduleNotification = useCallback(
    async ({
      title,
      body,
      data = {},
      sound = SOUND_ALARM_1,
      seconds,
    }: ScheduledNotificationPayload) => {
      await ensurePermission();

      const channelId = getChannelId(sound);

      return Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound,

          ...(Platform.OS === "android" && {
            channelId,
          }),
        },

        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(1, seconds),
          repeats: false,
        },
      });
    },
    [ensurePermission],
  );

  const cancelNotification = useCallback(async (notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }, []);

  const cancelAllNotifications = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  const getScheduledNotifications = useCallback(async () => {
    return Notifications.getAllScheduledNotificationsAsync();
  }, []);

  return {
    channels,
    notification,
    loading,
    permissionGranted,

    requestPermissions,

    /*
     * IMPORTANT:
     * useGeneratePrice will use this before creating
     * an alarm on the backend.
     */
    getOrCreateUserId,

    sendNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getScheduledNotifications,
  };
};

export default useNotifications;
