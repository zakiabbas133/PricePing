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
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import DropdownElement from "../components/Dropdown";
import useGeneratePrice from "../hooks/useGeneratePrice";

type SymbolScreenProps = {
  symbol: string;
  setSymbol: (symbol: string) => void;
};

const SymbolScreen = ({ symbol, setSymbol }: SymbolScreenProps) => {
  const insets = useSafeAreaInsets();
  const { price, status, createAlarm } = useGeneratePrice(symbol);
  const [targetInput, setTargetInput] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [futureOrSpot, setFutureOrSpot] = useState<"future" | "spot">("future");
  const [creating, setCreating] = useState(false);

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
    const normalizedSymbol = symbol.trim().toUpperCase();
    const target = Number(targetInput);

    if (!normalizedSymbol) {
      Alert.alert("Invalid Symbol", "Enter a valid Binance symbol.");
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
        return `Connected to Binance ${
          futureOrSpot === "future" ? "Futures" : "Spot"
        }`;

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
          paddingBottom: 30,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <Text style={styles.headerTitle}>Price Alarm</Text>

        <Text style={styles.subHeading}>
          Set an alarm and get notified when price reaches your target.
        </Text>

        {/* Create Alarm */}
        <View style={styles.card}>
          {/* Crypto Pair */}
          <View style={[styles.field, { marginTop: 0 }]}>
            <Text style={styles.label}>Crypto Pair</Text>

            <DropdownElement
              setValue={(value: string) => {
                setSymbol(value.trim().toUpperCase());
              }}
              value={symbol}
            />
          </View>

          {/* Spot / Futures */}
          <View style={[styles.directionContainer, { marginBottom: 12 }]}>
            <Pressable
              onPress={() => setFutureOrSpot("spot")}
              style={[
                styles.directionButton,
                futureOrSpot === "spot" && styles.marketSelected,
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
                futureOrSpot === "future" && styles.marketSelected,
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

          {/* Target Price */}
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

          {/* Direction */}
          <View style={styles.field}>
            <Text style={styles.label}>Direction</Text>

            <View style={styles.directionContainer}>
              {/* Above */}
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

              {/* Below */}
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

          {/* Set Alarm */}
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
          <View style={styles.priceHeader}>
            <Text style={styles.currentPriceLabel}>Current Price</Text>

            <Text style={styles.percentageText}>+1.24%</Text>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceValueContainer}>
              <Text style={styles.currentPrice}>{formatPrice(price)}</Text>

              <Text style={styles.currencyText}>USDT</Text>
            </View>

            <Text style={styles.timeframeText}>(24h)</Text>
          </View>
        </View>

        {/* Connection */}
        <View style={styles.connectionCard}>
          <View style={styles.connectionLeft}>
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
      </ScrollView>
    </View>
  );
};

/**
 * Parent component.
 *
 * The important part is:
 *
 * <SymbolScreen key={symbolInput} />
 *
 * React treats every symbol as a completely different
 * component instance.
 *
 * BTCUSDT -> SOLUSDT
 *
 * BTC hook is destroyed.
 * SOL hook is created.
 */
const Home = () => {
  const [symbolInput, setSymbolInput] = useState("BTCUSDT");

  return (
    <SymbolScreen
      key={symbolInput}
      symbol={symbolInput}
      setSymbol={setSymbolInput}
    />
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
    marginBottom: 0,
    fontFamily: "Outfit-Bold",
  },

  subHeading: {
    fontSize: 16,
    color: "#626770",
    marginBottom: 10,
    fontFamily: "Outfit-Medium",
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

    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,

    paddingHorizontal: 14,
    paddingVertical: 10,
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

  marketSelected: {
    backgroundColor: "#2B77F1",
    borderColor: "#2B77F1",
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

  priceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  currentPriceLabel: {
    fontSize: 15,
    color: "#000",
    fontFamily: "Outfit-Regular",
  },

  percentageText: {
    fontSize: 15,
    color: "#2DA076",
    fontFamily: "Outfit-SemiBold",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  priceValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 7,
  },

  currentPrice: {
    fontSize: 26,
    color: "#000",
    fontFamily: "Outfit-Bold",
  },

  currencyText: {
    fontSize: 14,
    color: "#626770",
    fontFamily: "Outfit-SemiBold",
  },

  timeframeText: {
    fontSize: 14,
    color: "#626770",
    fontFamily: "Outfit-Regular",
  },

  connectionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
  },

  connectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
});
