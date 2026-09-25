import Constants from "expo-constants";

const ConnectToApi = (
  UserId: string,
  Token: string,
  Platform: string,
  DeviceId: string,
) => {
  // const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl; // LIVE
  const apiBaseUrl = Constants.expoConfig?.extra?.localApiBaseUrl; // LOCAL
  const xApiKey = Constants.expoConfig?.extra?.xApiKey;

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("x-api-key", xApiKey);

  const raw = JSON.stringify({
    UserId,
    Token,
    Platform,
    DeviceId,
  });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const res = fetch(
    `${apiBaseUrl}/api/PushToken/register`,
    requestOptions as RequestInit,
  )
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      return result;
    })
    .catch((error) => {
      return error;
    });

  return res;
};

export default ConnectToApi;
