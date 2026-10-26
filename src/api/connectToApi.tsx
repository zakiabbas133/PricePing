import Constants from "expo-constants";

const ConnectToApi = (
  UserId: string,
  Token: string,
  Platform: string,
  DeviceId: string,
) => {
  const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  const xApiKey = Constants.expoConfig?.extra?.xApiKey;

  if (!apiBaseUrl) {
    throw new Error("API base URL is not configured.");
  }

  const body = JSON.stringify({
    UserId,
    Token,
    Platform,
    DeviceId,
  });

  return fetch(`${apiBaseUrl}/api/PushToken/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": xApiKey ?? "",
    },
    body,
  }).then(async (response) => {
    const responseText = await response.text();

    if (!response.ok) {
      return {
        status: false,
        message: "Unable to connect you to the app. Please restart the app.",
      };
    }

    try {
      return JSON.parse(responseText);
    } catch (error) {
      return error;
    }
  });
};

export default ConnectToApi;
