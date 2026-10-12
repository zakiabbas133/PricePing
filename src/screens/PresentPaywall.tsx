import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PACKAGE_TYPE, type PurchasesPackage } from "react-native-purchases";
import {
  getSubscriptionPackages,
  hasPremiumAccess,
  purchaseSubscription,
  restoreSubscriptions,
} from "../components/InitializeRevenueCat";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

const BLUE = "#2B77F1";
const DARK = "#101828";
const MUTED = "#667085";

type Plan = "annual" | "monthly";

type Props = {
  onClose?: () => void;
  onPremiumActivated?: () => void;
};

function PresentPaywall({ onClose, onPremiumActivated }: Props) {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan>("annual");
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadPackages = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const result = await getSubscriptionPackages();
      setPackages(result);

      const annual = result.find(
        (item) => item.packageType === PACKAGE_TYPE.ANNUAL,
      );

      const monthly = result.find(
        (item) => item.packageType === PACKAGE_TYPE.MONTHLY,
      );

      console.log('zaju');
      

      if (!annual && monthly) setSelectedPlan("monthly");
      else setSelectedPlan("annual");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load subscription plans.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const annualPackage = useMemo(
    () => packages.find((item) => item.packageType === PACKAGE_TYPE.ANNUAL),
    [packages],
  );

  const monthlyPackage = useMemo(
    () => packages.find((item) => item.packageType === PACKAGE_TYPE.MONTHLY),
    [packages],
  );

  const selectedPackage =
    selectedPlan === "annual"
      ? (annualPackage ?? monthlyPackage)
      : (monthlyPackage ?? annualPackage);

  const isAnnual = selectedPackage?.packageType === PACKAGE_TYPE.ANNUAL;

  const monthlyEquivalent = useMemo(() => {
    if (!annualPackage) return "";
    const price = annualPackage.product.price / 12;

    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: annualPackage.product.currencyCode,
        maximumFractionDigits: 2,
      }).format(price);
    } catch {
      return "";
    }
  }, [annualPackage]);

  const handlePurchase = async () => {
    if (!selectedPackage || purchasing) return;

    setPurchasing(true);
    setErrorMessage("");

    try {
      const customerInfo = await purchaseSubscription(selectedPackage);

      if (hasPremiumAccess(customerInfo)) {
        Alert.alert(
          "You're Premium! ✨",
          "Your Price Ping premium access is now active.",
          [{ text: "Let's go!", onPress: onPremiumActivated }],
        );
      } else {
        Alert.alert(
          "Purchase pending",
          "Your purchase was processed, but premium access is not active yet.",
        );
      }
    } catch (error) {
      const purchaseError = error as {
        userCancelled?: boolean;
        message?: string;
      };

      if (!purchaseError.userCancelled) {
        setErrorMessage(
          purchaseError.message ?? "Purchase failed. Please try again.",
        );
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (restoring) return;

    setRestoring(true);
    setErrorMessage("");

    try {
      const customerInfo = await restoreSubscriptions();

      if (hasPremiumAccess(customerInfo)) {
        Alert.alert(
          "Purchases restored",
          "Your Price Ping Premium subscription is active.",
          [{ text: "Continue", onPress: onPremiumActivated }],
        );
      } else {
        Alert.alert(
          "No active subscription",
          "We couldn't find an active Premium subscription for this store account.",
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to restore purchases.",
      );
    } finally {
      setRestoring(false);
    }
  };

  const benefits = [
    {
      icon: "∞",
      title: "Unlimited price alerts",
      subtitle: "Track the prices that matter to you",
    },
    {
      icon: "⚡",
      title: "Never miss a price move",
      subtitle: "Get notified when your target is reached",
    },
    {
      icon: "◈",
      title: "More control over your alerts",
      subtitle: "Build your personal crypto watchlist",
    },
    {
      icon: "♬",
      title: "Your alerts, your sound",
      subtitle: "Personalize your alarm experience",
    },
  ];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <LinearGradient
          colors={["#2B77F1", "#1554CB", "#103C98"]}
          locations={[0, 0.55, 1]}
          style={styles.hero}
        >
          <View style={styles.topBar}>
            {onClose ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close paywall"
                onPress={onClose}
                hitSlop={12}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            ) : (
              <View style={styles.closePlaceholder} />
            )}

            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>✦ PRICE PING PRO</Text>
            </View>

            <View style={styles.closePlaceholder} />
          </View>

          <View style={styles.heroArtwork}>
            <View style={[styles.orbit, styles.orbitOuter]} />
            <View style={[styles.orbit, styles.orbitInner]} />

            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartLabel}>BTC / USDT</Text>
                  <Text style={styles.chartSubLabel}>PRICE ALERT</Text>
                </View>
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>

              <View style={styles.chart}>
                <View style={[styles.chartLine, { height: 26 }]} />
                <View style={[styles.chartLine, { height: 43 }]} />
                <View style={[styles.chartLine, { height: 34 }]} />
                <View style={[styles.chartLine, { height: 56 }]} />
                <View style={[styles.chartLine, { height: 45 }]} />
                <View style={[styles.chartLine, { height: 66 }]} />
                <View style={[styles.chartLine, { height: 54 }]} />
                <View style={[styles.chartLine, { height: 78 }]} />
              </View>

              <View style={styles.targetRow}>
                <View style={styles.targetIcon}>
                  <Text style={styles.targetIconText}>↗</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.targetLabel}>Your target reached</Text>
                  <Text style={styles.targetValue}>Alert delivered ✓</Text>
                </View>
                <Text style={styles.targetCheck}>✓</Text>
              </View>
            </View>

            <View style={styles.floatingStar}>
              <Text style={styles.floatingStarText}>✦</Text>
            </View>
          </View>

          <Text style={styles.eyebrow}>TRADE SMARTER. STAY INFORMED.</Text>
          <Text style={styles.heroTitle}>
            Your market.{"\n"}Your alerts.{"\n"}
            <Text style={styles.heroTitleAccent}>Your advantage.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Never miss the price you're waiting for. Make every market move
            count.
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.benefitsHeader}>
            <Text style={styles.sectionTitle}>Unlock your full potential</Text>
            <Text style={styles.sectionSubtitle}>
              Everything you need to stay ahead.
            </Text>
          </View>

          <View style={styles.benefitList}>
            {benefits.map((item) => (
              <View key={item.title} style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <Text style={styles.benefitIconText}>{item.icon}</Text>
                </View>
                <View style={styles.benefitCopy}>
                  <Text style={styles.benefitTitle}>{item.title}</Text>
                  <Text style={styles.benefitSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.benefitCheck}>✓</Text>
              </View>
            ))}
          </View>

          <View style={styles.planHeading}>
            <Text style={styles.sectionTitle}>Choose your plan</Text>
            <Text style={styles.sectionSubtitle}>
              Pick the option that works for you.
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={BLUE} size="large" />
              <Text style={styles.loadingText}>
                Loading your subscription options…
              </Text>
            </View>
          ) : (
            <View style={styles.plans}>
              {annualPackage && (
                <Pressable
                  onPress={() => setSelectedPlan("annual")}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: selectedPlan === "annual",
                  }}
                  style={[
                    styles.planCard,
                    selectedPlan === "annual" && styles.planSelected,
                  ]}
                >
                  <View style={styles.planTopRow}>
                    <View
                      style={[
                        styles.radio,
                        selectedPlan === "annual" && styles.radioSelected,
                      ]}
                    >
                      {selectedPlan === "annual" && (
                        <View style={styles.radioDot} />
                      )}
                    </View>

                    <View style={styles.planNameBlock}>
                      <Text style={styles.planName}>Yearly</Text>
                      <Text style={styles.planDescription}>
                        Best value for serious alert watchers
                      </Text>
                    </View>

                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>BEST VALUE</Text>
                    </View>
                  </View>

                  <View style={styles.planPriceRow}>
                    <Text style={styles.planPrice}>
                      {annualPackage.product.priceString}
                    </Text>
                    <Text style={styles.planPeriod}>/ year</Text>
                  </View>

                  {monthlyEquivalent ? (
                    <Text style={styles.planFootnote}>
                      Just {monthlyEquivalent}/month, billed annually
                    </Text>
                  ) : null}
                </Pressable>
              )}

              {monthlyPackage && (
                <Pressable
                  onPress={() => setSelectedPlan("monthly")}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: selectedPlan === "monthly",
                  }}
                  style={[
                    styles.planCard,
                    selectedPlan === "monthly" && styles.planSelected,
                  ]}
                >
                  <View style={styles.planTopRow}>
                    <View
                      style={[
                        styles.radio,
                        selectedPlan === "monthly" && styles.radioSelected,
                      ]}
                    >
                      {selectedPlan === "monthly" && (
                        <View style={styles.radioDot} />
                      )}
                    </View>

                    <View style={styles.planNameBlock}>
                      <Text style={styles.planName}>Monthly</Text>
                      <Text style={styles.planDescription}>
                        Flexibility, month to month
                      </Text>
                    </View>

                    <Text style={styles.monthlyPrice}>
                      {monthlyPackage.product.priceString}
                      <Text style={styles.planPeriod}> / mo</Text>
                    </Text>
                  </View>
                </Pressable>
              )}

              {packages.length > 0 && !annualPackage && !monthlyPackage && (
                <View style={styles.noticeBox}>
                  <Text style={styles.noticeText}>
                    Your offering doesn't contain monthly or yearly plans.
                    Configure these package types in RevenueCat.
                  </Text>
                </View>
              )}
            </View>
          )}

          {!!errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              {!loading && packages.length === 0 && (
                <Pressable onPress={loadPackages}>
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              )}
            </View>
          )}

          <Pressable
            onPress={handlePurchase}
            disabled={loading || purchasing || !selectedPackage}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.ctaOuter,
              (loading || purchasing || !selectedPackage) && styles.ctaDisabled,
              pressed && styles.ctaPressed,
            ]}
          >
            <LinearGradient
              colors={["#3B82FF", "#2B77F1", "#1E5ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cta}
            >
              {purchasing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.ctaText}>Unlock Price Ping Pro</Text>
                  <Text style={styles.ctaArrow}>→</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.trustRow}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
              }}
            >
              <FontAwesome5 name="lock" size={10} color="#2B77F1" />
              <Text style={styles.trustText}>Secure checkout</Text>
            </View>
            <View style={styles.trustDivider} />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Ionicons name="checkmark" size={10} color="#2B77F1" />
              <Text style={styles.trustText}>Store verified</Text>
            </View>
          </View>

          <Text style={styles.renewalText}>
            {selectedPackage
              ? isAnnual
                ? `Billed ${selectedPackage.product.priceString} per year.`
                : `Billed ${selectedPackage.product.priceString} per month.`
              : "Subscription terms will be shown when plans load."}{" "}
            Subscriptions renew automatically unless cancelled according to the
            applicable store terms.
          </Text>

          <Pressable
            onPress={handleRestore}
            disabled={restoring}
            style={styles.restoreButton}
          >
            {restoring ? (
              <ActivityIndicator color={BLUE} />
            ) : (
              <Text style={styles.restoreText}>Restore purchases</Text>
            )}
          </Pressable>

          <View style={styles.legalRow}>
            <Text style={styles.legalText}>Terms of Use</Text>
            <Text style={styles.legalDot}>•</Text>
            <Text style={styles.legalText}>Privacy Policy</Text>
          </View>

          <Text style={styles.footerText}>
            Prices and availability are determined by your app store. Manage or
            cancel your subscription in your store account.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingBottom: 28 },
  hero: {
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 34,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  topBar: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: "#FFFFFF", fontSize: 26, lineHeight: 29 },
  closePlaceholder: { width: 34 },
  proBadge: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 30,
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  proBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  heroArtwork: {
    height: 224,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  orbit: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    borderRadius: 200,
  },
  orbitOuter: { width: 218, height: 218 },
  orbitInner: { width: 174, height: 174 },
  chartCard: {
    width: 246,
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "-3deg" }],
    shadowColor: "#061D50",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.23,
    shadowRadius: 22,
    elevation: 9,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chartLabel: { fontSize: 13, fontWeight: "800", color: DARK },
  chartSubLabel: {
    fontSize: 9,
    color: MUTED,
    letterSpacing: 1,
    marginTop: 3,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EAF8F0",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#12B76A",
  },
  liveText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#067647",
  },
  chart: {
    height: 86,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EAECF0",
  },
  chartLine: {
    width: 16,
    borderRadius: 5,
    backgroundColor: "#A7C9FF",
    borderTopWidth: 3,
    borderTopColor: BLUE,
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
    gap: 9,
  },
  targetIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  targetIconText: { color: BLUE, fontSize: 21, fontWeight: "800" },
  targetLabel: { color: DARK, fontSize: 11, fontWeight: "700" },
  targetValue: { color: "#12A76A", fontSize: 10, marginTop: 3 },
  targetCheck: { color: "#12B76A", fontSize: 20, fontWeight: "800" },
  floatingStar: {
    position: "absolute",
    right: 26,
    top: 24,
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  floatingStarText: { color: "#FFFFFF", fontSize: 25 },
  eyebrow: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#C5D9FF",
    marginTop: 5,
  },
  heroTitle: {
    textAlign: "center",
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "900",
    letterSpacing: -1,
    color: "#FFFFFF",
    marginTop: 13,
  },
  heroTitleAccent: { color: "#B9D5FF" },
  heroSubtitle: {
    maxWidth: 300,
    alignSelf: "center",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#E0EBFF",
    marginTop: 12,
  },
  content: { paddingHorizontal: 22, paddingTop: 28 },
  benefitsHeader: { marginBottom: 18 },
  sectionTitle: {
    color: DARK,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  benefitList: { gap: 19 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 13 },
  benefitIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#EDF4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitIconText: { fontSize: 23, color: BLUE, fontWeight: "800" },
  benefitCopy: { flex: 1 },
  benefitTitle: { color: DARK, fontSize: 14, fontWeight: "700" },
  benefitSubtitle: { color: MUTED, fontSize: 12, marginTop: 4 },
  benefitCheck: { color: BLUE, fontSize: 18, fontWeight: "800" },
  planHeading: { marginTop: 32, marginBottom: 16 },
  plans: { gap: 12 },
  planCard: {
    padding: 17,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "#EAECF0",
    backgroundColor: "#FFFFFF",
  },
  planSelected: {
    borderColor: BLUE,
    backgroundColor: "#F5F8FF",
  },
  planTopRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#D0D5DD",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: BLUE },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: BLUE,
  },
  planNameBlock: { flex: 1 },
  planName: { fontSize: 15, fontWeight: "800", color: DARK },
  planDescription: { fontSize: 11, color: MUTED, marginTop: 4 },
  savingsBadge: {
    backgroundColor: "#E6F8EE",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  savingsText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#067647",
    letterSpacing: 0.4,
  },
  planPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginLeft: 32,
    marginTop: 14,
  },
  planPrice: { color: DARK, fontSize: 27, fontWeight: "900" },
  planPeriod: { color: MUTED, fontSize: 12, fontWeight: "500" },
  planFootnote: { color: MUTED, fontSize: 11, marginLeft: 32, marginTop: 3 },
  monthlyPrice: { color: DARK, fontSize: 16, fontWeight: "800" },
  loadingBox: { paddingVertical: 28, alignItems: "center", gap: 12 },
  loadingText: { color: MUTED, fontSize: 13 },
  noticeBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FFF8E8",
  },
  noticeText: { color: "#854D0E", fontSize: 12, lineHeight: 18 },
  errorBox: {
    marginTop: 14,
    padding: 13,
    backgroundColor: "#FEF3F2",
    borderRadius: 12,
  },
  errorText: { color: "#B42318", fontSize: 12, lineHeight: 18 },
  retryText: {
    color: "#B42318",
    fontWeight: "800",
    marginTop: 8,
    textDecorationLine: "underline",
  },
  ctaOuter: {
    marginTop: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaDisabled: { opacity: 0.55 },
  ctaPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  cta: {
    minHeight: 58,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  ctaArrow: { color: "#FFFFFF", fontSize: 23, fontWeight: "600" },
  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 17,
  },
  trustText: { fontSize: 10, color: MUTED },
  trustDivider: { height: 13, width: 1, backgroundColor: "#D0D5DD" },
  renewalText: {
    textAlign: "center",
    color: MUTED,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 15,
    paddingHorizontal: 8,
  },
  restoreButton: {
    alignSelf: "center",
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: 5,
  },
  restoreText: { color: BLUE, fontSize: 12, fontWeight: "800" },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  legalText: {
    color: "#475467",
    fontSize: 11,
    textDecorationLine: "underline",
  },
  legalDot: { color: "#98A2B3" },
  footerText: {
    color: "#98A2B3",
    textAlign: "center",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 12,
    paddingHorizontal: 10,
  },
});

export default PresentPaywall;
