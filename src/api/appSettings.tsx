import { requestApi } from "./requestApi";

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

type UserAppSettings = {
  playNotifications?: boolean;
  playAlarmSound?: boolean;
  appVolume?: number;
};

type AlarmSoundResponse = {
  alarmSound?: string;
};

type AppVolumeResponse = {
  appVolume?: number;
};

const validateUserId = (userId: string) => {
  if (!userId?.trim()) {
    throw new Error(
      "Your account isn't ready yet. Please close and reopen the app.",
    );
  }
};

export const createUserAppSettings = (
  userId: string,
): Promise<ApiResponse<UserAppSettings>> => {
  validateUserId(userId);

  return requestApi<ApiResponse<UserAppSettings>>(
    `/api/AppSettings/createUserSettings?userId=${encodeURIComponent(userId)}`,
    {
      method: "POST",
    },
  );
};

export const updateAlarmSoundOnDb = (
  userId: string,
  sound: string,
): Promise<ApiResponse<AlarmSoundResponse>> => {
  validateUserId(userId);

  return requestApi<ApiResponse<AlarmSoundResponse>>(
    `/api/AppSettings/updateUserAlarmSound?userId=${encodeURIComponent(userId)}`,
    {
      method: "POST",
      body: JSON.stringify({
        AlarmSound: sound,
      }),
    },
  );
};

export const appVolumeChangeOnDb = (
  vol: number,
  userId: string,
): Promise<ApiResponse<AppVolumeResponse>> => {
  validateUserId(userId);

  if (!Number.isFinite(vol) || vol < 0 || vol > 1) {
    throw new Error("Choose a volume between muted and maximum.");
  }

  return requestApi<ApiResponse<AppVolumeResponse>>(
    `/api/AppSettings/changeAppVolume?userId=${encodeURIComponent(userId)}&volume=${encodeURIComponent(vol)}`,
    {
      method: "POST",
    },
  );
};
