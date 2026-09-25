import Constants from "expo-constants";
const deleteAlarmFromDb = async (id: number) => {  
  try {
    // const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl; // LIVE
    const apiBaseUrl = Constants.expoConfig?.extra?.localApiBaseUrl; // LOCAL

    const xApiKey = Constants.expoConfig?.extra?.xApiKey;
    const response = await fetch(`${apiBaseUrl}/api/Notifications/deleteAlarm?id=${id}`, {
      method: "DELETE",
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
    console.error("delete alarm error:", error);
    throw error;
  }
};

export default deleteAlarmFromDb;
