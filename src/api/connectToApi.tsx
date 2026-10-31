import { requestApi } from "./requestApi";

type PushTokenRegistrationResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

const ConnectToApi = (
  UserId: string,
  Token: string,
  Platform: string,
  DeviceId: string,
): Promise<PushTokenRegistrationResponse> => {
  if (!UserId?.trim()) {
    throw new Error(
      "Your account isn't ready yet. Please close and reopen the app.",
    );
  }

  if (!Token?.trim()) {
    throw new Error(
      "Notifications aren't ready yet. Allow notifications and try again.",
    );
  }

  return requestApi<PushTokenRegistrationResponse>("/api/PushToken/register", {
    method: "POST",
    body: JSON.stringify({
      UserId,
      Token,
      Platform,
      DeviceId,
    }),
  });
};

export default ConnectToApi;
