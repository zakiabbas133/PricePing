import Constants from "expo-constants";
const getAlarms = async (userId: string) => {
  try {
    // const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl; // LIVE
    const apiBaseUrl = Constants.expoConfig?.extra?.localApiBaseUrl; // LOCAL

    const xApiKey = Constants.expoConfig?.extra?.xApiKey;
    const response = await fetch(`${apiBaseUrl}/api/Notifications/getAlarms?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": xApiKey ?? "",
      },
    });
    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("get alarms error:", error);
    throw error;
  }
};

export default getAlarms;
