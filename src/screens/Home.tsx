import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import useBinancePriceAlarm from "../hooks/useBinanceBTCPrice";

const Home = () => {
  const {
    symbol,
    price,
    loading,
    status,
    activeAlarms,
    pastAlarms,
    createAlarm,
    deleteAlarm,
  } = useBinancePriceAlarm("BTCUSDT");

  const [symbolInput, setSymbolInput] = useState("BTCUSDT");

  const [targetInput, setTargetInput] = useState("");

  const [direction, setDirection] = useState<"above" | "below">("above");

  const [creating, setCreating] = useState(false);

  const formatPrice = (value: number | null) => {
    if (value === null || value === undefined) {
      return "—";
    }

    return Number(value.toFixed(2)).toLocaleString(undefined, {
      maximumFractionDigits: 8,
    });
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString();
  };

  const handleCreateAlarm = async () => {
    const normalizedSymbol = symbolInput.trim().toUpperCase();

    const target = Number(targetInput);

    if (!normalizedSymbol) {
      Alert.alert("Invalid Symbol", "Enter a Binance Futures symbol.");

      return;
    }

    if (!Number.isFinite(target) || target <= 0) {
      Alert.alert("Invalid Target Price", "Enter a valid target price.");

      return;
    }

    try {
      setCreating(true);

      await createAlarm(normalizedSymbol, target, direction);

      setTargetInput("");

      Alert.alert(
        "Alarm Created",
        `${normalizedSymbol} alarm created successfully.`,
      );
    } catch (error) {
      Alert.alert(
        "Unable to Create Alarm",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setCreating(false);
    }
  };

  const getConnectionText = () => {
    switch (status) {
      case "connected":
        return "Connected to Binance Futures";

      case "connecting":
        return "Connecting...";

      case "disconnected":
        return "Disconnected — reconnecting...";

      default:
        return "Not connected";
    }
  };

  const getConnectionColor = () => {
    switch (status) {
      case "connected":
        return "#12B76A";

      case "disconnected":
        return "#F04438";

      default:
        return "#98A2B3";
    }
  };

  const renderAlarm = (alarm: any) => {
    const isAbove = alarm.direction === "above";

    return (
      <View
        key={alarm.id}
        style={[styles.alarmCard, alarm.triggered && styles.triggeredAlarm]}
      >
        <View style={styles.alarmTop}>
          <Text style={styles.alarmSymbol}>{alarm.symbol}</Text>

          <View
            style={[styles.badge, alarm.triggered && styles.triggeredBadge]}
          >
            <Text
              style={[
                styles.badgeText,
                alarm.triggered && styles.triggeredBadgeText,
              ]}
            >
              {alarm.triggered ? "Triggered" : "Active"}
            </Text>
          </View>
        </View>

        <View style={styles.alarmDetails}>
          <View style={styles.directionRow}>
            <Text
              style={[
                styles.directionArrow,
                {
                  color: isAbove ? "#16A34A" : "#DC2626",
                },
              ]}
            >
              {isAbove ? "↑" : "↓"}
            </Text>

            <Text style={styles.directionText}>
              {isAbove ? "Above" : "Below"}
            </Text>

            <Text style={styles.alarmPrice}>{formatPrice(alarm.target)}</Text>
          </View>

          {alarm.triggered ? (
            <>
              <Text style={styles.detailText}>
                Triggered Price:{" "}
                <Text style={styles.detailStrong}>
                  {formatPrice(alarm.triggeredPrice)}
                </Text>
              </Text>

              <Text style={styles.detailText}>
                Triggered: {formatDate(alarm.triggeredAt)}
              </Text>
            </>
          ) : (
            <Text style={styles.detailText}>
              Created: {formatDate(alarm.createdAt)}
            </Text>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            Alert.alert("Delete Alarm", `Delete the ${alarm.symbol} alarm?`, [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => deleteAlarm(alarm.id),
              },
            ]);
          }}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Price Alarm</Text>

        {/* Create Alarm */}
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Crypto Pair</Text>

            <TextInput
              value={symbolInput}
              onChangeText={setSymbolInput}
              placeholder="BTCUSDT"
              placeholderTextColor="#98A2B3"
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.input}
            />

            <Text style={styles.helperText}>Binance USDⓈ-M Futures symbol</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Target Price</Text>

            <TextInput
              value={targetInput}
              onChangeText={setTargetInput}
              placeholder="92500"
              placeholderTextColor="#98A2B3"
              keyboardType="decimal-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Direction</Text>

            <View style={styles.directionContainer}>
              <Pressable
                onPress={() => setDirection("above")}
                style={[
                  styles.directionButton,
                  direction === "above" && styles.aboveSelected,
                ]}
              >
                <Text
                  style={[
                    styles.directionButtonText,
                    direction === "above" && styles.selectedDirectionText,
                  ]}
                >
                  ↑ Above
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setDirection("below")}
                style={[
                  styles.directionButton,
                  direction === "below" && styles.belowSelected,
                ]}
              >
                <Text
                  style={[
                    styles.directionButtonText,
                    direction === "below" && styles.selectedDirectionText,
                  ]}
                >
                  ↓ Below
                </Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            disabled={creating}
            onPress={handleCreateAlarm}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
              creating && styles.disabledButton,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {creating ? "Creating..." : "🔔 Set Alarm"}
            </Text>
          </Pressable>
        </View>

        {/* Current Price */}
        <View style={[styles.card, styles.priceCard]}>
          <Text style={styles.priceLabel}>Current Futures Price</Text>

          <Text style={styles.livePrice}>
            {loading ? "—" : formatPrice(price)}
          </Text>

          <Text style={styles.symbolText}>{symbol}</Text>

          <View style={styles.connection}>
            <View
              style={[
                styles.connectionDot,
                {
                  backgroundColor: getConnectionColor(),
                },
              ]}
            />

            <Text style={styles.connectionText}>{getConnectionText()}</Text>
          </View>
        </View>

        {/* Quick Settings */}

        {/* Active Alarms */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Alarms</Text>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{activeAlarms.length}</Text>
          </View>
        </View>

        {activeAlarms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>

            <Text style={styles.emptyText}>No active alarms</Text>
          </View>
        ) : (
          activeAlarms.map(renderAlarm)
        )}

        {/* Past Alarms */}
        <View style={[styles.sectionHeader, styles.pastSectionHeader]}>
          <Text style={styles.sectionTitle}>Past Alarms</Text>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{pastAlarms.length}</Text>
          </View>
        </View>

        {pastAlarms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>

            <Text style={styles.emptyText}>No past alarms</Text>
          </View>
        ) : (
          pastAlarms.map(renderAlarm)
        )}
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    padding: 20,
  },

  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#101828",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#101828",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#101828",
    backgroundColor: "#FFFFFF",
  },

  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: "#667085",
  },

  directionContainer: {
    flexDirection: "row",
    gap: 10,
  },

  directionButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  aboveSelected: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },

  belowSelected: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },

  directionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#344054",
  },

  selectedDirectionText: {
    color: "#FFFFFF",
  },

  primaryButton: {
    width: "100%",
    height: 50,
    borderRadius: 11,
    backgroundColor: "#1677FF",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonPressed: {
    backgroundColor: "#0D6EFD",
    opacity: 0.9,
  },

  disabledButton: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  priceCard: {
    alignItems: "center",
  },

  priceLabel: {
    color: "#667085",
    fontSize: 14,
  },

  livePrice: {
    fontSize: 35,
    fontWeight: "700",
    color: "#101828",
    marginTop: 8,
    marginBottom: 4,
  },

  symbolText: {
    fontSize: 14,
    color: "#667085",
  },

  connection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },

  connectionDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  connectionText: {
    fontSize: 13,
    color: "#667085",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 12,
  },

  pastSectionHeader: {
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#101828",
  },

  countBadge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 7,
    borderRadius: 13,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1677FF",
  },

  alarmCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  triggeredAlarm: {
    borderColor: "#F04438",
  },

  alarmTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  alarmSymbol: {
    fontSize: 17,
    fontWeight: "700",
    color: "#101828",
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#ECFDF3",
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#027A48",
  },

  triggeredBadge: {
    backgroundColor: "#FEF3F2",
  },

  triggeredBadgeText: {
    color: "#B42318",
  },

  alarmDetails: {
    marginTop: 12,
  },

  directionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  directionArrow: {
    fontSize: 20,
    fontWeight: "700",
    marginRight: 5,
  },

  directionText: {
    fontSize: 14,
    color: "#475467",
    marginRight: 7,
  },

  alarmPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#101828",
  },

  detailText: {
    fontSize: 14,
    lineHeight: 24,
    color: "#475467",
  },

  detailStrong: {
    fontWeight: "700",
    color: "#101828",
  },

  deleteButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingVertical: 4,
  },

  deleteButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F04438",
  },

  pressed: {
    opacity: 0.6,
  },

  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 14,
    paddingVertical: 25,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  emptyIcon: {
    fontSize: 25,
    marginBottom: 7,
  },

  emptyText: {
    fontSize: 14,
    color: "#98A2B3",
    textAlign: "center",
  },

  settingRow: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EAECF0",
    paddingVertical: 12,
  },

  settingInfo: {
    flex: 1,
    paddingRight: 15,
  },

  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#101828",
  },

  settingDescription: {
    fontSize: 12,
    color: "#667085",
    marginTop: 4,
    lineHeight: 17,
  },

  warningText: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 17,
    color: "#B42318",
  },
});
