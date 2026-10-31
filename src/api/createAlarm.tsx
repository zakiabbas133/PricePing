import type {
  PriceAlarm,
  PriceAlarmWidthoutId,
} from "../hooks/useGeneratePrice";
import { requestApi } from "./requestApi";

type CreateAlarmResponse = {
  success?: boolean;
  data?: PriceAlarm[];
  alarmsCount?: number;
  message?: string;
};

const createAlarmOnBackend = (
  alarm: PriceAlarmWidthoutId,
  userId: string,
): Promise<CreateAlarmResponse> => {
  if (!userId?.trim()) {
    throw new Error(
      "Your account isn't ready yet. Please close and reopen the app.",
    );
  }

  return requestApi<CreateAlarmResponse>("/api/Notifications/generateAlarm", {
    method: "POST",
    body: JSON.stringify({
      ...alarm,
      userId,
    }),
  });
};

export default createAlarmOnBackend;
