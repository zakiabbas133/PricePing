import Constants from "expo-constants";
const getAlarms = async (userId: string) => {
  try {
    if (!userId) {
      console.warn("Cannot fetch alarms: userId is missing.");
      return;
    }
    const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
    const xApiKey = Constants.expoConfig?.extra?.xApiKey;

    const response = await fetch(
      `${apiBaseUrl}/api/Notifications/getAlarms?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": xApiKey ?? "",
        },
      },
    );
    const responseText = await response.text();

    if (!response.ok) {
      return {
        status: false,
        message: "Unable to retrive alarms. Please try again later.",
      };
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("get alarms error:", error);
    return error;
  }
};

export default getAlarms;
