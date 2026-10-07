import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Navigation } from "../navigation/StackNavigator";
import { PriceAlarmWidthoutId } from "./useGeneratePrice";
import { createUserAppSettings } from "../api/appSettings";
import {
  setAlarms,
  setNotificationsEnabled,
  setSoundEnabled,
  setUserId,
  setVolume,
} from "../store/appSlice";
import Constants from "expo-constants";
import ConnectToApi from "../api/connectToApi";
import * as Notifications from "expo-notifications";

const CHANNEL_ALARM_1 = "price-alerts-alarm1";
const CHANNEL_ALARM_2 = "price-alerts-alarm2";

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

const useNotifications = () => {
  const navigation = useNavigation<Navigation>();

  const dispatch = useDispatch();

  /**
   * The Expo push token is the only identifier we use.
   *
   * We keep it in a ref so multiple components/effects calling
   * getPushToken() don't unnecessarily register the same token.
   */
  const pushTokenRef = useRef<string | null>(null);

  /**
   * Prevent multiple simultaneous token requests.
   */
  const tokenPromiseRef = useRef<Promise<string | null> | null>(null);

  /**
   * Prevent multiple simultaneous API synchronization calls.
   */
  const tokenSyncPromiseRef = useRef<Promise<string | null> | null>(null);

  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  const [permissionGranted, setPermissionGranted] = useState(false);

  /**
   * Request notification permission.
   */
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

  /**
   * Get the current Expo push token.
   *
   * No userId is involved.
   */
  const getPushToken = useCallback(async () => {
    /**
     * Return the token already obtained during this app session.
     */
    if (pushTokenRef.current) {
      return pushTokenRef.current;
    }

    /**
     * If another request is already running, wait for it.
     */
    if (tokenPromiseRef.current) {
      return tokenPromiseRef.current;
    }

    const promise = (async () => {
      try {
        if (Platform.OS === "web") {
          return null;
        }

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

        if (!token) {
          throw new Error("Expo push token was not generated.");
        }

        dispatch(setUserId(token));

        pushTokenRef.current = token;

        return token;
      } catch (error) {
        console.error("Get push token error:", error);

        return null;
      } finally {
        tokenPromiseRef.current = null;
      }
    })();

    tokenPromiseRef.current = promise;

    return promise;
  }, [requestPermissions]);

  const syncPushToken = useCallback(async () => {
    if (tokenSyncPromiseRef.current) {
      return tokenSyncPromiseRef.current;
    }

    const promise = (async () => {
      try {
        if (Platform.OS === "web") {
          return null;
        }

        const token = await getPushToken();

        if (!token) {
          return null;
        }

        const response = await ConnectToApi(
          token,
          token,
          Platform.OS,
          Constants.deviceName || "",
        );

        if (!response?.success) {
          throw new Error("Unable to synchronize push token.");
        }

        const responseAppSettings = await createUserAppSettings(token);

        if (responseAppSettings?.success) {
          dispatch(
            setNotificationsEnabled(
              responseAppSettings.data?.playNotifications,
            ),
          );

          dispatch(setSoundEnabled(responseAppSettings.data?.playAlarmSound));

          dispatch(setVolume(responseAppSettings.data?.appVolume));
        }

        dispatch(setUserId(token));

        return token;
      } catch (error) {
        console.error("Push token synchronization error:", error);

        return null;
      } finally {
        tokenSyncPromiseRef.current = null;
      }
    })();

    tokenSyncPromiseRef.current = promise;

    return promise;
  }, [dispatch, getPushToken]);

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
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await initializeChannels();
        await syncPushToken();
      } catch (error) {
        console.error("Notification initialization error:", error);
      }
    };

    initialize();

    const notificationListener = Notifications.addNotificationReceivedListener(
      (receivedNotification) => {
        const data = receivedNotification.request.content.data;

        const alarms = data?.alarms;
        const alarmToSend = data?.alarmToSend as PriceAlarmWidthoutId;

        if (Array.isArray(alarms)) {
          dispatch(setAlarms(alarms));
        }

        if (mounted) {
          setNotification(receivedNotification);
        }

        navigation.navigate("PlayAlarm", { alarmToSend: alarmToSend });
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        const alarms = data?.alarms;

        const alarmToSend = data?.alarmToSend as PriceAlarmWidthoutId;

        if (Array.isArray(alarms)) {
          dispatch(setAlarms(alarms));
        }

        setNotification(response.notification);

        navigation.navigate("PlayAlarm", { alarmToSend: alarmToSend });
      });

    return () => {
      mounted = false;

      notificationListener.remove();
      responseListener.remove();
    };
  }, [dispatch, initializeChannels, navigation, syncPushToken]);

  return {
    notification,
    permissionGranted,
    requestPermissions,
    getPushToken,
    syncPushToken,
  };
};

export default useNotifications;
