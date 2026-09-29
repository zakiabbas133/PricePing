import Constants from "expo-constants";

// const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl; // LIVE
const apiBaseUrl = Constants.expoConfig?.extra?.localApiBaseUrl; // LOCAL

export const getAppSettings = (userId: string) => {};

export const updateAlarmSoundOnDb = async (userId: string, sound: any) => {
  try {
    const xApiKey = Constants.expoConfig?.extra?.xApiKey;

    const raw = JSON.stringify({
      AlarmSound: sound,
    });

    const response = await fetch(
      `${apiBaseUrl}/api/AppSettings/updateUserAlarmSound?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": xApiKey ?? "",
        },
        body: raw,
      },
    );

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("createAlarmOnBackend error:", error);
    throw error;
  }
};

export const createUserAppSettings = async (userId: string) => {
  try {
    const xApiKey = Constants.expoConfig?.extra?.xApiKey;

    const response = await fetch(
      `${apiBaseUrl}/api/AppSettings/createUserSettings?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": xApiKey ?? "",
        },
      },
    );

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("createUserSettings error:", error);
    throw error;
  }
};

export const appVolumeChangeOnDb = async (vol: number, userId: string) => {
  try {
    const xApiKey = Constants.expoConfig?.extra?.xApiKey;

    const response = await fetch(
      `${apiBaseUrl}/api/AppSettings/changeAppVolume?userId=${userId}&volume=${vol}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": xApiKey ?? "",
        },
      },
    );

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("createUserSettings error:", error);
    throw error;
  }
};
