import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  setAlarms,
  setNotificationsEnabled,
  setSoundEnabled,
  setUserId,
  setVolume,
} from "../store/appSlice";

import ConnectToApi from "../api/connectToApi";
import { RootState } from "../store/store";
import { createUserAppSettings } from "../api/appSettings";

const CHANNEL_ALARM_1 = "price-alerts-alarm1";
const CHANNEL_ALARM_2 = "price-alerts-alarm2";

const USER_ID_KEY = "@priceping_user_id";

const SOUND_ALARM_1 = "alarm1.mp3";
const SOUND_ALARM_2 = "alarm2.mp3";

export type NotificationSound =
  | typeof SOUND_ALARM_1
  | typeof SOUND_ALARM_2;

type NotificationData = Record<string, unknown>;

export type NotificationPayload = {
  title: string;
  body: string;
  data?: NotificationData;
  sound?: NotificationSound;
};

export type ScheduledNotificationPayload =
  NotificationPayload & {
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

const getChannelId = (sound: NotificationSound) =>
  sound === SOUND_ALARM_2
    ? CHANNEL_ALARM_2
    : CHANNEL_ALARM_1;

const generateGUID = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;

      return v.toString(16);
    },
  );

const useNotifications = () => {
  const dispatch = useDispatch();

  const reduxUserId = useSelector(
    (state: RootState) => state.app.userId,
  );

  const reduxUserIdRef = useRef<string | null>(
    reduxUserId || null,
  );

  const userIdPromiseRef =
    useRef<Promise<string | null> | null>(null);

  const tokenSyncPromiseRef =
    useRef<Promise<string | null> | null>(null);

  const [channels, setChannels] = useState<
    Notifications.NotificationChannel[]
  >([]);

  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] =
    useState(false);

  /*
   * Always keep the latest Redux userId in memory.
   */
  useEffect(() => {
    if (reduxUserId) {
      reduxUserIdRef.current = reduxUserId;
    }
  }, [reduxUserId]);

  /*
   * ---------------------------------------------------------
   * PERMISSIONS
   * ---------------------------------------------------------
   */
  const requestPermissions = useCallback(async () => {
    try {
      const existing =
        await Notifications.getPermissionsAsync();

      let status = existing.status;

      if (status !== "granted") {
        const requested =
          await Notifications.requestPermissionsAsync();

        status = requested.status;
      }

      const granted = status === "granted";

      setPermissionGranted(granted);

      return granted;
    } catch (error) {
      console.error(
        "Notification permission error:",
        error,
      );

      setPermissionGranted(false);

      return false;
    }
  }, []);

  /*
   * ---------------------------------------------------------
   * GET OR CREATE USER ID
   * ---------------------------------------------------------
   *
   * The userId NEVER changes just because the push token
   * changes.
   */
  const getOrCreateUserId = useCallback(async () => {
    /*
     * Already in memory.
     */
    if (reduxUserIdRef.current) {
      return reduxUserIdRef.current;
    }

    /*
     * Another request is already creating/loading it.
     */
    if (userIdPromiseRef.current) {
      return userIdPromiseRef.current;
    }

    const promise = (async () => {
      try {
        /*
         * First check persistent storage.
         */
        const storedUserId =
          await AsyncStorage.getItem(USER_ID_KEY);

        if (storedUserId) {
          reduxUserIdRef.current = storedUserId;

          dispatch(setUserId(storedUserId));

          return storedUserId;
        }

        /*
         * New installation/user.
         *
         * We need notification permission before registering
         * the device because the userId is associated with
         * push notification registration.
         */
        const granted = await requestPermissions();

        if (!granted) {
          return null;
        }

        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId;

        if (!projectId) {
          throw new Error("Expo project ID not found.");
        }

        /*
         * Get the first Expo push token.
         */
        const tokenResponse =
          await Notifications.getExpoPushTokenAsync({
            projectId,
          });

        const token = tokenResponse.data;

        /*
         * Check storage again in case another async operation
         * created the user while we were waiting.
         */
        const latestStoredUserId =
          await AsyncStorage.getItem(USER_ID_KEY);

        if (latestStoredUserId) {
          reduxUserIdRef.current = latestStoredUserId;

          dispatch(setUserId(latestStoredUserId));

          return latestStoredUserId;
        }

        /*
         * Create a permanent app/device user ID.
         */
        const newUserId = generateGUID();

        /*
         * IMPORTANT:
         * ConnectToApi should UPSERT the token for this userId.
         */
        const response = await ConnectToApi(
          newUserId,
          token,
          Platform.OS,
          Constants.deviceName || "",
        );

        if (!response?.success) {
          throw new Error(
            "Unable to register push token.",
          );
        }

        /*
         * Create default settings ONLY for a brand-new user.
         */
        const responseAppSettings =
          await createUserAppSettings(newUserId);

        if (responseAppSettings?.success) {
          dispatch(
            setNotificationsEnabled(
              responseAppSettings.data?.playNotifications,
            ),
          );

          dispatch(
            setSoundEnabled(
              responseAppSettings.data?.playAlarmSound,
            ),
          );

          dispatch(
            setVolume(
              responseAppSettings.data?.appVolume,
            ),
          );
        }

        /*
         * Persist userId.
         */
        await AsyncStorage.setItem(
          USER_ID_KEY,
          newUserId,
        );

        reduxUserIdRef.current = newUserId;

        dispatch(setUserId(newUserId));

        return newUserId;
      } catch (error) {
        console.error(
          "Get/create user ID error:",
          error,
        );

        return null;
      } finally {
        userIdPromiseRef.current = null;
      }
    })();

    userIdPromiseRef.current = promise;

    return promise;
  }, [dispatch, requestPermissions]);

  /*
   * ---------------------------------------------------------
   * SYNC CURRENT PUSH TOKEN
   * ---------------------------------------------------------
   *
   * This is the important part.
   *
   * Every time the app initializes:
   *
   *     existing userId
   *          +
   *     current Expo token
   *          ↓
   *       backend
   *
   * If the token changed, backend gets the new token.
   *
   * If it didn't change, backend simply receives the same
   * token again.
   */
  const syncPushToken = useCallback(async () => {
    /*
     * Prevent multiple simultaneous token registrations.
     */
    if (tokenSyncPromiseRef.current) {
      return tokenSyncPromiseRef.current;
    }

    const promise = (async () => {
      try {
        if (Platform.OS === "web") {
          return null;
        }

        /*
         * Make sure we have a persistent userId.
         */
        const userId = await getOrCreateUserId();

        if (!userId) {
          return null;
        }

        /*
         * Get current notification permission.
         */
        const granted = await requestPermissions();

        if (!granted) {
          /*
           * Do NOT delete the userId.
           *
           * The user may enable notifications later.
           */
          return null;
        }

        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId;

        if (!projectId) {
          throw new Error(
            "Expo project ID not found.",
          );
        }

        /*
         * Always ask Expo for the current token.
         *
         * Do not rely on an old token stored locally.
         */
        const tokenResponse =
          await Notifications.getExpoPushTokenAsync({
            projectId,
          });

        const token = tokenResponse.data;

        if (!token) {
          return null;
        }

        /*
         * IMPORTANT:
         *
         * This must UPDATE/UPSERT the existing user.
         *
         * It must NOT create another userId.
         */
        const response = await ConnectToApi(
          userId,
          token,
          Platform.OS,
          Constants.deviceName || "",
        );

        if (!response?.success) {
          throw new Error(
            "Unable to synchronize push token.",
          );
        }

        return token;
      } catch (error) {
        /*
         * Network failures should NOT destroy the user's
         * userId or local state.
         *
         * The next app launch will try again.
         */
        console.error(
          "Push token synchronization error:",
          error,
        );

        return null;
      } finally {
        tokenSyncPromiseRef.current = null;
      }
    })();

    tokenSyncPromiseRef.current = promise;

    return promise;
  }, [getOrCreateUserId, requestPermissions]);

  /*
   * ---------------------------------------------------------
   * INITIALIZE CHANNELS
   * ---------------------------------------------------------
   */
  const initializeChannels = useCallback(async () => {
    if (Platform.OS !== "android") {
      return;
    }

    await Notifications.setNotificationChannelAsync(
      CHANNEL_ALARM_1,
      {
        name: "Price Alerts - Alarm 1",
        importance: Notifications.AndroidImportance.MAX,
        sound: "alarm1",
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
      },
    );

    await Notifications.setNotificationChannelAsync(
      CHANNEL_ALARM_2,
      {
        name: "Price Alerts - Alarm 2",
        importance: Notifications.AndroidImportance.MAX,
        sound: "alarm2",
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
      },
    );

    const availableChannels =
      await Notifications.getNotificationChannelsAsync();

    setChannels(availableChannels);
  }, []);

  /*
   * ---------------------------------------------------------
   * INITIALIZATION
   * ---------------------------------------------------------
   */
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await initializeChannels();

        /*
         * This handles:
         *
         * - first installation
         * - normal app launch
         * - App Store update
         * - TestFlight update
         * - token changes
         * - permission restored
         * - temporary network failure
         *
         * Existing userId stays unchanged.
         */
        await syncPushToken();
      } catch (error) {
        console.error(
          "Notification initialization error:",
          error,
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    /*
     * Notification received while app is running.
     */
    const notificationListener =
      Notifications.addNotificationReceivedListener(
        (receivedNotification) => {
          const data =
            receivedNotification.request.content.data;

          const alarms = data?.alarms;

          if (Array.isArray(alarms)) {
            dispatch(setAlarms(alarms));
          }

          if (mounted) {
            setNotification(receivedNotification);
          }
        },
      );

    /*
     * User taps notification.
     */
    const responseListener =
      Notifications.addNotificationResponseReceivedListener(
        () => {
          // Handle notification response if required.
        },
      );

    return () => {
      mounted = false;

      notificationListener.remove();
      responseListener.remove();
    };
  }, [
    dispatch,
    initializeChannels,
    syncPushToken,
  ]);

  /*
   * ---------------------------------------------------------
   * ENSURE PERMISSION
   * ---------------------------------------------------------
   */
  const ensurePermission = useCallback(async () => {
    if (permissionGranted) {
      return true;
    }

    const granted = await requestPermissions();

    if (!granted) {
      throw new Error(
        "Notification permission was not granted.",
      );
    }

    /*
     * Permission may have just been restored.
     *
     * Make sure backend has the current token.
     */
    await syncPushToken();

    return true;
  }, [
    permissionGranted,
    requestPermissions,
    syncPushToken,
  ]);

  /*
   * ---------------------------------------------------------
   * SEND IMMEDIATELY
   * ---------------------------------------------------------
   */
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

  /*
   * ---------------------------------------------------------
   * SCHEDULE
   * ---------------------------------------------------------
   */
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
          type:
            Notifications.SchedulableTriggerInputTypes
              .TIME_INTERVAL,
          seconds: Math.max(1, seconds),
          repeats: false,
        },
      });
    },
    [ensurePermission],
  );

  /*
   * ---------------------------------------------------------
   * CANCEL
   * ---------------------------------------------------------
   */
  const cancelNotification = useCallback(
    async (notificationId: string) => {
      await Notifications.cancelScheduledNotificationAsync(
        notificationId,
      );
    },
    [],
  );

  const cancelAllNotifications = useCallback(
    async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();
    },
    [],
  );

  const getScheduledNotifications = useCallback(
    async () => {
      return Notifications.getAllScheduledNotificationsAsync();
    },
    [],
  );

  return {
    channels,
    notification,
    loading,
    permissionGranted,

    requestPermissions,

    getOrCreateUserId,

    /*
     * Expose this if you ever want to manually force a
     * token synchronization after login/settings changes.
     */
    syncPushToken,

    sendNotification,
    scheduleNotification,

    cancelNotification,
    cancelAllNotifications,
    getScheduledNotifications,
  };
};

export default useNotifications;