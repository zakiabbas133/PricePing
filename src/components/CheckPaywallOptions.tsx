import { useSelector } from "react-redux";
import { RootState } from "../store/store";

// const FREE_TRIAL_DAYS = 7;
const FREE_ALARM_LIMIT = 3;
// const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const isTrialExpired = (
  trialStartedAt: string | null,
  alarmsCount: number,
  isPremium: boolean,
): boolean => {
  try {
    if (!trialStartedAt) {
      return false;
    }
    // const startedAt = new Date(trialStartedAt).getTime();
    // const now = Date.now();
    // const elapsedTime = now - startedAt;
    return (
      // !isPremium &&
      // (elapsedTime >= FREE_TRIAL_DAYS * ONE_DAY_MS ||
      //   alarmsCount >= FREE_ALARM_LIMIT)
      !isPremium && alarmsCount >= FREE_ALARM_LIMIT
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};
