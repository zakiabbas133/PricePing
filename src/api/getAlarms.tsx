import type { PriceAlarm } from "../hooks/useGeneratePrice";
import { requestApi } from "./requestApi";

type GetAlarmsResponse = {
  success?: boolean;
  data?: PriceAlarm[];
  message?: string;
};

const getAlarms = (userId: string): Promise<GetAlarmsResponse> => {
  if (!userId?.trim()) {
    throw new Error(
      "Your account isn't ready yet. Please close and reopen the app.",
    );
  }

  return requestApi<GetAlarmsResponse>(
    `/api/Notifications/getAlarms?userId=${encodeURIComponent(userId)}`,
  );
};

export default getAlarms;
