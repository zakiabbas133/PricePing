import Constants from "expo-constants";
import { PriceAlarmWidthoutId } from "../hooks/useGeneratePrice";

const createAlarmOnBackend = async (
  alarm: PriceAlarmWidthoutId,
  userId: string,
) => {
  try {
    const alarmToSend = {
      ...alarm,
      userId,
    };

    const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl; // LIVE
    // const apiBaseUrl = Constants.expoConfig?.extra?.localApiBaseUrl; // LOCAL

    const xApiKey = Constants.expoConfig?.extra?.xApiKey;

    const response = await fetch(
      `${apiBaseUrl}/api/Notifications/generateAlarm`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": xApiKey ?? "",
        },
        body: JSON.stringify(alarmToSend),
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

export default createAlarmOnBackend;
