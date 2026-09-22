import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useBinancePriceAlarm from "../hooks/useBinanceBTCPrice";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import DropdownElement from "../components/Dropdown";

const Home = () => {
  const insets = useSafeAreaInsets();
  const [symbolInput, setSymbolInput] = useState("BTCUSDT");
  const [targetInput, setTargetInput] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [futureOrSpot, setFutureOrSpot] = useState<"future" | "spot">("future");
  const [creating, setCreating] = useState(false);

  const { price, loading, status, createAlarm } =
    useBinancePriceAlarm(symbolInput);

  const formatPrice = (value: number | null) => {
    if (value === null || value === undefined) {
      return "—";
    }

    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
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

      await createAlarm(normalizedSymbol, target, direction, futureOrSpot);

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

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.headerTitle}>Price Alarm</Text>

        {/* Create Alarm */}
        <View style={styles.card}>
          <View style={[styles.field, { marginTop: 0 }]}>
            <Text style={styles.label}>Crypto Pair</Text>

            <DropdownElement
              setValue={(val: string) => setSymbolInput(val)}
              value={symbolInput}
            />
          </View>

          <View style={[styles.directionContainer, { marginBottom: 12 }]}>
            <Pressable
              onPress={() => setFutureOrSpot("spot")}
              style={[
                styles.directionButton,
                futureOrSpot === "spot" && { backgroundColor: "#2B77F1" },
              ]}
            >
              <Text
                style={[
                  styles.directionButtonText,
                  futureOrSpot === "spot" && styles.selectedDirectionText,
                ]}
              >
                Spot
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setFutureOrSpot("future")}
              style={[
                styles.directionButton,
                futureOrSpot === "future" && { backgroundColor: "#2B77F1" },
              ]}
            >
              <Text
                style={[
                  styles.directionButtonText,
                  futureOrSpot === "future" && styles.selectedDirectionText,
                ]}
              >
                Futures
              </Text>
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Target Price</Text>

            <TextInput
              value={targetInput}
              onChangeText={setTargetInput}
              placeholder="92500"
              placeholderTextColor="#98A2B3"
              keyboardType="decimal-pad"
              style={[
                styles.input,
                {
                  borderWidth: 1,
                  borderColor: "#D0D5DD",
                  borderRadius: 10,
                  paddingHorizontal: 14,
                },
              ]}
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
                <AntDesign
                  name="arrow-up"
                  size={15}
                  color={direction === "above" ? "#fff" : "#000"}
                />
                <Text
                  style={[
                    styles.directionButtonText,
                    direction === "above" && styles.selectedDirectionText,
                  ]}
                >
                  Above
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setDirection("below")}
                style={[
                  styles.directionButton,
                  direction === "below" && styles.belowSelected,
                ]}
              >
                <AntDesign
                  name="arrow-down"
                  size={15}
                  color={direction === "below" ? "#fff" : "#000"}
                />
                <Text
                  style={[
                    styles.directionButtonText,
                    direction === "below" && styles.selectedDirectionText,
                  ]}
                >
                  Below
                </Text>
              </Pressable>
            </View>
          </View>

          <TouchableOpacity
            disabled={creating}
            onPress={handleCreateAlarm}
            style={[styles.primaryButton, creating && styles.disabledButton]}
          >
            <MaterialCommunityIcons name="bell" size={16} color="#fff" />
            <Text style={styles.primaryButtonText}>
              {creating ? "Creating..." : "Set Alarm"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Price */}
        <View style={styles.card}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                color: "#000",
                fontFamily: "Outfit-Regular",
              }}
            >
              Current Price
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: "#2DA076",
                fontFamily: "Outfit-SemiBold",
              }}
            >
              +1.24%
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                gap: 7,
              }}
            >
              <Text
                style={{
                  fontSize: 26,
                  color: "#000",
                  fontFamily: "Outfit-Bold",
                }}
              >
                {loading ? "—" : formatPrice(price)}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#626770",
                  fontFamily: "Outfit-SemiBold",
                }}
              >
                USDT
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                color: "#626770",
                fontFamily: "Outfit-Regular",
              }}
            >
              (24h)
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.card,
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
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
          <MaterialCommunityIcons
            name="signal"
            size={24}
            color={getConnectionColor()}
          />
        </View>

        {/* Quick Settings */}
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  headerTitle: {
    fontSize: 25,
    color: "#101828",
    marginBottom: 10,
    fontFamily: "Outfit-Bold",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },

  field: {
    marginTop: 8,
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#101828",
    marginBottom: 8,
    fontFamily: "Outfit-SemiBold",
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#101828",
    backgroundColor: "#FFFFFF",
    fontFamily: "Outfit-Regular",
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
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
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
    fontFamily: "Outfit-Medium",
  },

  selectedDirectionText: {
    color: "#FFFFFF",
  },

  primaryButton: {
    flex: 1,
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    backgroundColor: "#1677FF",
  },

  disabledButton: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Outfit-SemiBold",
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
    justifyContent: "space-between",
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
    color: "#626770",
    fontFamily: "Outfit-SemiBold",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // marginTop: 8,
    marginBottom: 12,
  },

  pastSectionHeader: {
    // marginTop: 20,
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
