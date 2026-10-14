import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
} from "react-native-purchases";

let configured = false;

export async function configureRevenueCat(): Promise<void> {
  if (configured) return;

  const apiKey =
    Platform.OS === "ios"
      ? "test_ojLJacCcrMMNLprTspzQmzgwCuC" //appl_lWnrZYxwQjCRzKzUNDRZaNdMwNC
      : Platform.OS === "android"
        ? process.env.EXPO_PUBLIC_RC_ANDROID_API_KEY
        : undefined;

  if (!apiKey) {
    throw new Error(`Missing RevenueCat API key for ${Platform.OS}`);
  }

  Purchases.setLogLevel(LOG_LEVEL.ERROR);
  Purchases.configure({ apiKey });
  configured = true;
}

export async function getSubscriptionPackages() {
  const offerings = await Purchases.getOfferings();
  const offering = offerings.current;

  if (!offering) {
    throw new Error(
      "No current offering found. Check your RevenueCat dashboard.",
    );
  }

  return offering.availablePackages;
}

export async function purchaseSubscription(
  pkg: PurchasesPackage,
): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restoreSubscriptions(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

export function hasPremiumAccess(info: CustomerInfo): boolean {
  return Boolean(info.entitlements.active["premium"]);
}
