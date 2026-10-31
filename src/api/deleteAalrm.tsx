import type { PriceAlarm } from "../hooks/useGeneratePrice";
import { requestApi } from "./requestApi";

type DeleteAlarmResponse = {
  success?: boolean;
  data?: PriceAlarm[];
  message?: string;
};

const deleteAlarmFromDb = (id: number): Promise<DeleteAlarmResponse> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error(
      "We couldn't find that price alert. Refresh the list and try again.",
    );
  }

  return requestApi<DeleteAlarmResponse>(
    `/api/Notifications/deleteAlarm?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
};

export default deleteAlarmFromDb;
