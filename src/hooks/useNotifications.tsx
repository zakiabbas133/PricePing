import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
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

const getChannelId = (sound: NotificationSound) => {
  return sound === SOUND_ALARM_2 ? CHANNEL_ALARM_2 : CHANNEL_ALARM_1;
};

const useNotifications = () => {
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    [],
  );

  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

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
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "Notification response:",
          response.notification.request.content.data,
        );
      });

    return () => {
      mounted = false;

      notificationListener.remove();
      responseListener.remove();
    };
  }, [initializeChannels, requestPermissions]);

  const ensurePermission = async () => {
    if (permissionGranted) {
      return true;
    }

    const granted = await requestPermissions();

    if (!granted) {
      throw new Error("Notification permission was not granted.");
    }

    return true;
  };

  const sendNotification = async ({
    title,
    body,
    data = {},
    sound = SOUND_ALARM_1,
  }: NotificationPayload) => {
    await ensurePermission();

    const channelId = getChannelId(sound);

    const notificationId = await Notifications.scheduleNotificationAsync({
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

    return notificationId;
  };

  const scheduleNotification = async ({
    title,
    body,
    data = {},
    sound = SOUND_ALARM_1,
    seconds,
  }: ScheduledNotificationPayload) => {
    await ensurePermission();

    const channelId = getChannelId(sound);

    const notificationId = await Notifications.scheduleNotificationAsync({
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

    return notificationId;
  };

  const cancelNotification = async (notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const getScheduledNotifications = async () => {
    return Notifications.getAllScheduledNotificationsAsync();
  };

  return {
    channels,
    notification,
    loading,
    permissionGranted,
    requestPermissions,
    sendNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getScheduledNotifications,
  };
};

export default useNotifications;
