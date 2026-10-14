import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PACKAGE_TYPE, type PurchasesPackage } from "react-native-purchases";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getSubscriptionPackages,
  hasPremiumAccess,
  purchaseSubscription,
  restoreSubscriptions,
} from "../components/InitializeRevenueCat";
import { Navigation } from "../navigation/StackNavigator";
import { setIsUserPremium } from "../store/appSlice";
import { RootState } from "../store/store";
import PurchaseModal from "../components/PurchaseModal";
import { AntDesign } from "@expo/vector-icons";

const BLUE = "#2B77F1";
const BLUE_DARK = "#175CD3";
const DARK = "#101828";
const MUTED = "#667085";
const BORDER = "#E4EAF3";
const LIGHT_BLUE = "#F3F7FF";

type PurchaseMessage = {
  title: string;
  message: string;
  successWarnOrError: number;
};

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
  const dispatch = useDispatch();

  const premiumUser = useSelector((state: RootState) => state.app.premiumUser);

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PurchasesPackage | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPurchasedModal, setShowPurchaseModal] = useState(false);

  const [purchaseMessage, setPurchaseMessage] = useState<PurchaseMessage>({
    title: "Title",
    message: "Message",
    successWarnOrError: 1,
  });

  const loadPackages = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const result = await getSubscriptionPackages();

      setPackages(result);

      // Prefer annual, then monthly, then the first available package.
      setSelectedPlan(
        result.find((pkg) => pkg.packageType === PACKAGE_TYPE.ANNUAL) ??
          result.find((pkg) => pkg.packageType === PACKAGE_TYPE.MONTHLY) ??
          result[0] ??
          null,
      );
    } catch (error) {
      setPackages([]);
      setSelectedPlan(null);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load subscription plans. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const annualPackage = packages.find(
    (pkg) => pkg.packageType === PACKAGE_TYPE.ANNUAL,
  );

  const hasMonthly = packages.some(
    (pkg) => pkg.packageType === PACKAGE_TYPE.MONTHLY,
  );

  const hasAnnual = Boolean(annualPackage);

  const closePaywall = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "PricePingTabs" }],
    });
  };

  const onActivatingPremium = async () => {
    try {
      dispatch(
        setIsUserPremium({
          trialStartedAt: premiumUser.trialStartedAt,
          alarmsCreatedCount: premiumUser.alarmsCreatedCount,
          isPremium: true,
          paywallVisible: false,
        }),
      );

      navigation.reset({
        index: 0,
        routes: [{ name: "PricePingTabs" }],
      });
    } catch (error) {
      console.error("Error activating Premium:", error);
    }
  };

  const handlePurchase = async () => {
    if (purchasing || loading) return;

    if (!selectedPlan) {
      setErrorMessage("Please select a subscription plan first.");
      return;
    }

    setPurchasing(true);
    setErrorMessage("");

    try {
      const customerInfo = await purchaseSubscription(selectedPlan);

      if (hasPremiumAccess(customerInfo)) {
        setPurchaseMessage({
          title: "You're Premium! ✨",
          message: "Your Price Ping Premium access is now active.",
          successWarnOrError: 1,
        });

        await onActivatingPremium();
      } else {
        setPurchaseMessage({
          title: "Purchase pending",
          message:
            "Your purchase was processed, but Premium access is not active yet. Please try restoring your purchases.",
          successWarnOrError: 2,
        });

        setShowPurchaseModal(true);
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
        setPurchaseMessage({
          title: "Purchases restored",
          message: "Your Price Ping Premium subscription is active.",
          successWarnOrError: 1,
        });
      } else {
        setPurchaseMessage({
          title: "No active subscription",
          message:
            "We couldn't find an active Premium subscription for this store account.",
          successWarnOrError: 2,
        });
      }

      setShowPurchaseModal(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to restore purchases. Please try again.",
      );
    } finally {
      setRestoring(false);
    }
  };

  const packageOrder: Partial<Record<PACKAGE_TYPE, number>> = {
    [PACKAGE_TYPE.ANNUAL]: 3,
    [PACKAGE_TYPE.MONTHLY]: 2,
    [PACKAGE_TYPE.WEEKLY]: 1,
  };

  const benefits = [
    {
      icon: "∞",
      title: "Unlimited price alerts",
      subtitle: "Track the prices that matter to you",
    },
    {
      icon: "↗",
      title: "Never miss a price move",
      subtitle: "Get notified when your target is reached",
    },
    {
      icon: "◈",
      title: "Your personal crypto watchlist",
      subtitle: "Stay in control of the prices you follow",
    },
    {
      icon: "♫",
      title: "Personalized alarm sounds",
      subtitle: "Make every alert work your way",
    },
  ];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close paywall"
        onPress={closePaywall}
        hitSlop={12}
        style={({ pressed }) => [
          styles.closeButton,
          pressed && styles.closeButtonPressed,
        ]}
      >
        <AntDesign name="close" size={16} color="#5e97f3" />
      </Pressable>
      <ScrollView
        style={styles.root}
        contentContainerStyle={[
          styles.screen,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <LinearGradient
          colors={["#2B77F1", "#2168E8", "#1554CB"]}
          locations={[0, 0.58, 1]}
          style={[styles.hero, { paddingTop: 20 }]}
        >
          <View style={styles.topBar}>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>✦ PRICE PING PROOO</Text>
            </View>
          </View>

          <View style={styles.heroArtwork}>
            <View style={styles.orbitOuter} />
            <View style={styles.orbitInner} />

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
                {[26, 43, 34, 56, 45, 66, 54, 78].map((height, index) => (
                  <View key={index} style={[styles.chartLine, { height }]} />
                ))}
              </View>

              <View style={styles.targetRow}>
                <View style={styles.targetIcon}>
                  <Text style={styles.targetIconText}>↗</Text>
                </View>

                <View style={styles.targetCopy}>
                  <Text style={styles.targetLabel}>Your target reached</Text>
                  <Text style={styles.targetValue}>Alert delivered</Text>
                </View>

                <View style={styles.targetCheckCircle}>
                  <Text style={styles.targetCheck}>✓</Text>
                </View>
              </View>
            </View>

            <View style={styles.floatingStar}>
              <Text style={styles.floatingStarText}>✦</Text>
            </View>

            <View style={styles.floatingPrice}>
              <Text style={styles.floatingPriceLabel}>PRICE HIT</Text>
              <Text style={styles.floatingPriceValue}>✓ Alert</Text>
            </View>
          </View>

          <Text style={styles.eyebrow}>TRADE SMARTER. STAY INFORMED.</Text>

          <Text style={styles.heroTitle}>
            Your market.{"\n"}
            Your alerts.{"\n"}
            <Text style={styles.heroTitleAccent}>Your advantage.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Never miss the price you're waiting for. Make every market move
            count.
          </Text>

          <View style={styles.heroTrust}>
            <View style={styles.heroTrustItem}>
              <Text style={styles.heroTrustCheck}>✓</Text>
              <Text style={styles.heroTrustText}>Real-time tracking</Text>
            </View>

            <View style={styles.heroTrustDivider} />

            <View style={styles.heroTrustItem}>
              <Text style={styles.heroTrustCheck}>✓</Text>
              <Text style={styles.heroTrustText}>Custom alerts</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionEyebrow}>
              <View style={styles.sectionEyebrowDot} />
              <Text style={styles.sectionEyebrowText}>PREMIUM FEATURES</Text>
            </View>

            <Text style={styles.sectionTitle}>Stay ahead of the market</Text>
            <Text style={styles.sectionSubtitle}>
              Everything you need to make your alerts work harder.
            </Text>
          </View>

          <View style={styles.benefitCard}>
            {benefits.map((item, index) => (
              <View key={item.title}>
                <View style={styles.benefitRow}>
                  <View style={styles.benefitIcon}>
                    <Text style={styles.benefitIconText}>{item.icon}</Text>
                  </View>

                  <View style={styles.benefitCopy}>
                    <Text style={styles.benefitTitle}>{item.title}</Text>
                    <Text style={styles.benefitSubtitle}>{item.subtitle}</Text>
                  </View>

                  <View style={styles.benefitCheckCircle}>
                    <Text style={styles.benefitCheck}>✓</Text>
                  </View>
                </View>

                {index < benefits.length - 1 && (
                  <View style={styles.benefitDivider} />
                )}
              </View>
            ))}
          </View>

          <View style={styles.planHeading}>
            <Text style={styles.sectionTitle}>Choose your plan</Text>
            <Text style={styles.sectionSubtitle}>
              Unlock every feature with the plan that suits you.
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={BLUE} size="large" />
              <Text style={styles.loadingText}>
                Loading subscription plans…
              </Text>
            </View>
          ) : (
            <View style={styles.plans}>
              {packages
                .sort(
                  (a, b) =>
                    (packageOrder[b.packageType] ?? 0) -
                    (packageOrder[a.packageType] ?? 0),
                )
                .map((pkg) => {
                  const isSelected =
                    selectedPlan?.identifier === pkg.identifier;
                  const isAnnual = pkg.packageType === PACKAGE_TYPE.ANNUAL;
                  const isMonthly = pkg.packageType === PACKAGE_TYPE.MONTHLY;
                  const isBestValue =
                    annualPackage?.identifier === pkg.identifier;

                  return (
                    <Pressable
                      key={pkg.identifier}
                      onPress={() => {
                        setSelectedPlan(pkg);
                        setErrorMessage("");
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      style={({ pressed }) => [
                        styles.planCard,
                        isBestValue && styles.bestValueCard,
                        isSelected && styles.planSelected,
                        pressed && styles.planPressed,
                      ]}
                    >
                      {isBestValue && (
                        <View style={styles.bestValueRibbon}>
                          <Text style={styles.bestValueRibbonText}>
                            ✦ BEST VALUE
                          </Text>
                        </View>
                      )}

                      <View style={styles.planTopRow}>
                        <View
                          style={[
                            styles.radio,
                            isSelected && styles.radioSelected,
                          ]}
                        >
                          {isSelected && <View style={styles.radioDot} />}
                        </View>

                        <View style={styles.planNameBlock}>
                          <Text
                            style={[
                              styles.planName,
                              isSelected && styles.planNameSelected,
                            ]}
                          >
                            {pkg.product.title}
                          </Text>

                          <Text style={styles.planDescription}>
                            {isAnnual
                              ? "Our best value for a full year"
                              : isMonthly
                                ? "Flexible monthly subscription"
                                : "Full access to Premium features"}
                          </Text>
                        </View>

                        {isSelected && (
                          <View style={styles.selectedBadge}>
                            <Text style={styles.selectedBadgeText}>
                              SELECTED
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.planPriceRow}>
                        <Text
                          style={[
                            styles.planPrice,
                            isSelected && styles.planPriceSelected,
                          ]}
                        >
                          {pkg.product.priceString}
                        </Text>

                        <Text style={styles.planPeriod}>
                          / {pkg.product.title.toLowerCase()}
                        </Text>
                      </View>

                      {isAnnual && pkg.product.pricePerMonthString && (
                        <View
                          style={[
                            styles.monthlyEquivalent,
                            isSelected && styles.monthlyEquivalentSelected,
                          ]}
                        >
                          <View style={styles.monthlyEquivalentIcon}>
                            <Text style={styles.monthlyEquivalentIconText}>
                              ↓
                            </Text>
                          </View>

                          <Text style={styles.monthlyEquivalentText}>
                            Equivalent to{" "}
                            <Text style={styles.monthlyEquivalentPrice}>
                              {pkg.product.pricePerMonthString}/month
                            </Text>
                          </Text>
                        </View>
                      )}

                      {isSelected && (
                        <View style={styles.planSelectedFooter}>
                          <View style={styles.planSelectedFooterLine} />
                          <Text style={styles.planSelectedFooterText}>
                            {isAnnual
                              ? "One annual payment · Cancel anytime through your store"
                              : isMonthly
                                ? "Billed monthly · Cancel anytime through your store"
                                : "Subscription renews according to store terms"}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}

              {packages.length === 0 && !errorMessage && (
                <View style={styles.emptyPlans}>
                  <View style={styles.emptyPlansIcon}>
                    <Text style={styles.emptyPlansIconText}>◇</Text>
                  </View>
                  <Text style={styles.emptyPlansTitle}>
                    Plans aren't available yet
                  </Text>
                  <Text style={styles.emptyPlansText}>
                    Please try again in a moment.
                  </Text>
                  <Pressable onPress={loadPackages} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Reload plans</Text>
                  </Pressable>
                </View>
              )}

              {packages.length > 0 && (!hasMonthly || !hasAnnual) && (
                <View style={styles.configurationNotice}>
                  <View style={styles.configurationNoticeIcon}>
                    <Text style={styles.configurationNoticeIconText}>i</Text>
                  </View>

                  <Text style={styles.configurationNoticeText}>
                    {!hasMonthly && !hasAnnual
                      ? "Monthly and yearly packages aren't available in this offering."
                      : !hasMonthly
                        ? "A monthly package isn't available in this offering."
                        : "A yearly package isn't available in this offering."}{" "}
                    Check your RevenueCat offering configuration if this is
                    unexpected.
                  </Text>
                </View>
              )}
            </View>
          )}

          {!!errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>!</Text>
              <View style={styles.errorCopy}>
                <Text style={styles.errorTitle}>Something went wrong</Text>
                <Text style={styles.errorText}>{errorMessage}</Text>

                {!loading && packages.length === 0 && (
                  <Pressable onPress={loadPackages}>
                    <Text style={styles.retryText}>Try again</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {/* Purchase CTA */}
          <Pressable
            onPress={handlePurchase}
            disabled={loading || purchasing || !selectedPlan}
            accessibilityRole="button"
            accessibilityLabel={
              selectedPlan
                ? `Continue with ${selectedPlan.product.title} subscription`
                : "Choose a subscription plan"
            }
            style={({ pressed }) => [
              styles.ctaOuter,
              (loading || purchasing || !selectedPlan) && styles.ctaDisabled,
              pressed && styles.ctaPressed,
            ]}
          >
            <LinearGradient
              colors={["#3986FF", "#2B77F1", "#1E5ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cta}
            >
              {purchasing ? (
                <>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.ctaText}>Processing purchase…</Text>
                </>
              ) : (
                <>
                  <View style={styles.ctaIcon}>
                    <Text style={styles.ctaIconText}>✦</Text>
                  </View>

                  <Text style={styles.ctaText}>Unlock Price Ping Pro</Text>

                  <View style={styles.ctaArrowCircle}>
                    <Text style={styles.ctaArrow}>→</Text>
                  </View>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Text style={styles.ctaSubtext}>
            {selectedPlan
              ? `${selectedPlan.product.priceString} · ${selectedPlan.product.title} plan`
              : "Choose a plan to continue"}
          </Text>

          <View style={styles.trustCard}>
            <View style={styles.trustItem}>
              <View style={styles.trustIcon}>
                <Text style={styles.trustIconText}>✓</Text>
              </View>
              <Text style={styles.trustText}>Secure checkout</Text>
            </View>

            <View style={styles.trustDivider} />

            <View style={styles.trustItem}>
              <View style={styles.trustIcon}>
                <Text style={styles.trustIconText}>⌑</Text>
              </View>
              <Text style={styles.trustText}>Store verified</Text>
            </View>
          </View>

          <Text style={styles.renewalText}>
            Subscriptions renew automatically unless cancelled according to the
            applicable store terms. Prices, billing periods, and renewal details
            are determined by your app store.
          </Text>

          <Pressable
            onPress={handleRestore}
            disabled={restoring}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.restoreButton,
              pressed && styles.restoreButtonPressed,
            ]}
          >
            {restoring ? (
              <ActivityIndicator color={BLUE} />
            ) : (
              <Text style={styles.restoreText}>Restore purchases</Text>
            )}
          </Pressable>

          <View style={styles.legalRow}>
            <Pressable
              accessibilityRole="link"
              onPress={() => {
                // Replace with your Terms of Use URL.
              }}
            >
              <Text style={styles.legalText}>Terms of Use</Text>
            </Pressable>

            <View style={styles.legalDot} />

            <Pressable
              accessibilityRole="link"
              onPress={() => {
                // Replace with your Privacy Policy URL.
              }}
            >
              <Text style={styles.legalText}>Privacy Policy</Text>
            </Pressable>
          </View>

          <Text style={styles.footerText}>
            Manage or cancel your subscription through your Apple App Store or
            Google Play account.
          </Text>
        </View>

        {showPurchasedModal && (
          <PurchaseModal
            setPurchaseModal={setShowPurchaseModal}
            purchaseMessage={purchaseMessage}
            onPurchaseModalClose={
              purchaseMessage.successWarnOrError === 1
                ? onActivatingPremium
                : () => setShowPurchaseModal(false)
            }
          />
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screen: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
  },
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },
  topBar: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderColor: "#5e97f3",
    borderWidth: 2,
    position: "absolute",
    zIndex: 99,
    top: 20,
    left: 20,
  },
  closeButtonPressed: {
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  topBarSpacer: {
    width: 36,
  },
  proBadge: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignSelf: "center",
  },
  proBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Outfit-Bold",
    letterSpacing: 1.2,
  },
  heroArtwork: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 2,
  },
  orbitOuter: {
    position: "absolute",
    width: 214,
    height: 214,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.17)",
  },
  orbitInner: {
    position: "absolute",
    width: 174,
    height: 174,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  chartCard: {
    width: 248,
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "-2deg" }],
    shadowColor: "#0B2C6B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chartLabel: {
    fontSize: 13,
    fontFamily: "Outfit-Bold",
    color: DARK,
  },
  chartSubLabel: {
    fontSize: 9,
    color: MUTED,
    letterSpacing: 1,
    marginTop: 3,
    fontFamily: "Outfit-Regular",
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
    fontFamily: "Outfit-Bold",
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
  targetIconText: {
    color: BLUE,
    fontSize: 21,
    fontWeight: "800",
  },
  targetCopy: {
    flex: 1,
  },
  targetLabel: {
    color: DARK,
    fontSize: 11,
    fontFamily: "Outfit-Bold",
  },
  targetValue: {
    color: "#12A76A",
    fontSize: 10,
    marginTop: 3,
    fontFamily: "Outfit-Regular",
  },
  targetCheckCircle: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: "#EAF8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  targetCheck: {
    color: "#12B76A",
    fontSize: 14,
    fontWeight: "900",
  },
  floatingStar: {
    position: "absolute",
    right: 22,
    top: 15,
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  floatingStarText: {
    color: "#FFFFFF",
    fontSize: 24,
  },
  floatingPrice: {
    position: "absolute",
    left: 0,
    bottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0B2C6B",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  floatingPriceLabel: {
    color: MUTED,
    fontSize: 8,
    fontFamily: "Outfit-Bold",
    letterSpacing: 1,
  },
  floatingPriceValue: {
    color: BLUE_DARK,
    fontSize: 12,
    fontFamily: "Outfit-Bold",
    marginTop: 3,
  },
  eyebrow: {
    textAlign: "center",
    fontSize: 10,
    fontFamily: "Outfit-Bold",
    letterSpacing: 1.8,
    color: "#D8E6FF",
    marginTop: 5,
  },
  heroTitle: {
    textAlign: "center",
    fontSize: 33,
    lineHeight: 40,
    fontFamily: "Outfit-Bold",
    letterSpacing: -1,
    color: "#FFFFFF",
    marginTop: 13,
  },
  heroTitleAccent: {
    color: "#CFE0FF",
    fontFamily: "Outfit-Bold",
  },
  heroSubtitle: {
    maxWidth: 300,
    alignSelf: "center",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: "#E4EDFF",
    fontFamily: "Outfit-Medium",
    marginTop: 11,
  },
  heroTrust: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    marginTop: 19,
  },
  heroTrustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroTrustCheck: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  heroTrustText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Outfit-SemiBold",
  },
  heroTrustDivider: {
    width: 1,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 29,
  },
  sectionHeading: {
    marginBottom: 17,
  },
  sectionEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 9,
  },
  sectionEyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BLUE,
  },
  sectionEyebrowText: {
    color: BLUE,
    fontSize: 10,
    fontFamily: "Outfit-Bold",
    letterSpacing: 1.3,
  },
  sectionTitle: {
    color: DARK,
    fontSize: 21,
    fontFamily: "Outfit-Bold",
    letterSpacing: -0.55,
  },
  sectionSubtitle: {
    color: MUTED,
    fontFamily: "Outfit-Regular",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  benefitCard: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
  },
  benefitIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EDF4FF",
    borderWidth: 1,
    borderColor: "#E0EBFF",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitIconText: {
    fontSize: 22,
    color: BLUE,
    fontWeight: "800",
  },
  benefitCopy: {
    flex: 1,
  },
  benefitTitle: {
    color: DARK,
    fontSize: 13,
    fontFamily: "Outfit-Bold",
  },
  benefitSubtitle: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
    fontFamily: "Outfit-Regular",
  },
  benefitCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#EAF8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitCheck: {
    color: "#039855",
    fontSize: 12,
    fontWeight: "900",
  },
  benefitDivider: {
    height: 1,
    backgroundColor: "#F0F2F6",
    marginLeft: 55,
  },
  planHeading: {
    marginTop: 32,
    marginBottom: 16,
  },
  plans: {
    gap: 12,
  },
  planCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
    padding: 17,
    shadowColor: "#1D2939",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 1,
  },
  bestValueCard: {
    borderColor: "#B7D1FF",
    backgroundColor: "#F8FAFF",
  },
  planSelected: {
    borderColor: BLUE,
    backgroundColor: "#F2F7FF",
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  planPressed: {
    opacity: 0.93,
  },
  bestValueRibbon: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "#E5EFFF",
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "#C7DBFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginBottom: 13,
  },
  bestValueRibbonText: {
    color: BLUE_DARK,
    fontSize: 9,
    fontFamily: "Outfit-Bold",
    letterSpacing: 0.8,
  },
  planTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.7,
    borderColor: "#B8C3D4",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: BLUE,
    borderWidth: 2,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BLUE,
  },
  planNameBlock: {
    flex: 1,
  },
  planName: {
    color: DARK,
    fontSize: 16,
    fontFamily: "Outfit-Bold",
  },
  planNameSelected: {
    color: BLUE_DARK,
    fontFamily: "Outfit-Bold",
  },
  planDescription: {
    color: MUTED,
    fontFamily: "Outfit-Regular",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  selectedBadge: {
    borderRadius: 20,
    backgroundColor: "#E2EDFF",
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  selectedBadgeText: {
    color: BLUE_DARK,
    fontSize: 8,
    fontFamily: "Outfit-Bold",
    letterSpacing: 0.4,
  },
  planPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    marginTop: 18,
  },
  planPrice: {
    color: DARK,
    fontSize: 44,
    fontFamily: "Outfit-Bold",
    letterSpacing: -0.9,
  },
  planPriceSelected: {
    color: BLUE_DARK,
    fontFamily: "Outfit-Bold",
  },
  planPeriod: {
    color: MUTED,
    fontSize: 12,
    fontFamily: "Outfit-Regular",
    marginLeft: 6,
  },
  monthlyEquivalent: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    backgroundColor: "#F0F5FF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 12,
  },
  monthlyEquivalentSelected: {
    backgroundColor: "#E4EEFF",
  },
  monthlyEquivalentIcon: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#DCE8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  monthlyEquivalentIconText: {
    color: BLUE_DARK,
    fontSize: 12,
    fontWeight: "900",
  },
  monthlyEquivalentText: {
    color: "#475467",
    fontSize: 11,
    fontFamily: "Outfit-Regular",
  },
  monthlyEquivalentPrice: {
    color: BLUE_DARK,
    fontFamily: "Outfit-Bold",
  },
  planSelectedFooter: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#DCE8FA",
  },
  planSelectedFooterLine: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: BLUE,
    marginTop: 5,
  },
  planSelectedFooterText: {
    flex: 1,
    color: "#475467",
    fontFamily: "Outfit-Regular",
    fontSize: 10,
    lineHeight: 15,
  },
  loadingBox: {
    paddingVertical: 35,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: MUTED,
    fontSize: 13,
    fontFamily: "Outfit-Regular",
  },
  emptyPlans: {
    alignItems: "center",
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
  },
  emptyPlansIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: LIGHT_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPlansIconText: {
    color: BLUE,
    fontSize: 27,
  },
  emptyPlansTitle: {
    color: DARK,
    fontSize: 15,
    fontFamily: "Outfit-Bold",
    marginTop: 12,
  },
  emptyPlansText: {
    color: MUTED,
    fontFamily: "Outfit-Regular",
    fontSize: 12,
    marginTop: 5,
  },
  retryButton: {
    marginTop: 15,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#EAF2FF",
  },
  retryButtonText: {
    color: BLUE_DARK,
    fontSize: 12,
    fontFamily: "Outfit-Bold",
  },
  configurationNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DCE8FA",
    backgroundColor: "#F5F8FF",
  },
  configurationNoticeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E1ECFF",
    alignItems: "center",
    justifyContent: "center",
  },
  configurationNoticeIconText: {
    color: BLUE_DARK,
    fontSize: 12,
    fontWeight: "900",
  },
  configurationNoticeText: {
    flex: 1,
    color: "#475467",
    fontFamily: "Outfit-Regular",
    fontSize: 11,
    lineHeight: 17,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 14,
    padding: 13,
    backgroundColor: "#FFF5F4",
    borderColor: "#FEE4E2",
    borderWidth: 1,
    borderRadius: 13,
  },
  errorIcon: {
    width: 21,
    height: 21,
    borderRadius: 11,
    overflow: "hidden",
    textAlign: "center",
    textAlignVertical: "center",
    color: "#B42318",
    backgroundColor: "#FEE4E2",
    fontWeight: "900",
  },
  errorCopy: {
    flex: 1,
  },
  errorTitle: {
    color: "#912018",
    fontSize: 12,
    fontFamily: "Outfit-Bold",
  },
  errorText: {
    color: "#B42318",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    fontFamily: "Outfit-Regular",
  },
  retryText: {
    color: "#B42318",
    fontFamily: "Outfit-Bold",
    marginTop: 8,
    textDecorationLine: "underline",
  },
  ctaOuter: {
    marginTop: 24,
    borderRadius: 17,
    overflow: "hidden",
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  ctaPressed: {
    transform: [{ scale: 0.99 }],
  },
  cta: {
    minHeight: 59,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaIcon: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 8,
    top: 8,
    transform: [{ rotate: "-20deg" }],
  },
  ctaIconText: {
    color: "#FFFFFF",
    fontSize: 17,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Outfit-Bold",
    flexShrink: 1,
  },
  ctaArrowCircle: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 23,
    fontWeight: "800",
  },
  ctaSubtext: {
    textAlign: "center",
    color: MUTED,
    fontSize: 11,
    marginTop: 10,
    fontFamily: "Outfit-Regular",
  },
  trustCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginTop: 20,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  trustIcon: {
    width: 21,
    height: 21,
    borderRadius: 7,
    backgroundColor: "#E6F7EE",
    alignItems: "center",
    justifyContent: "center",
  },
  trustIconText: {
    color: "#039855",
    fontSize: 12,
    fontWeight: "900",
  },
  trustText: {
    color: "#475467",
    fontSize: 10,
    fontFamily: "Outfit-SemiBold",
  },
  trustDivider: {
    height: 19,
    width: 1,
    backgroundColor: "#D0D5DD",
  },
  renewalText: {
    textAlign: "center",
    color: MUTED,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 15,
    paddingHorizontal: 6,
    fontFamily: "Outfit-Regular",
  },
  restoreButton: {
    alignSelf: "center",
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: 6,
    borderRadius: 10,
  },
  restoreButtonPressed: {
    backgroundColor: "#F2F7FF",
  },
  restoreText: {
    color: BLUE_DARK,
    fontSize: 12,
    fontFamily: "Outfit-Bold",
  },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 13,
    marginTop: 8,
  },
  legalText: {
    color: "#475467",
    fontSize: 11,
    textDecorationLine: "underline",
    fontFamily: "Outfit-Regular",
  },
  legalDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#98A2B3",
  },
  footerText: {
    color: "#98A2B3",
    textAlign: "center",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 12,
    paddingHorizontal: 8,
    fontFamily: "Outfit-Regular",
  },
});
