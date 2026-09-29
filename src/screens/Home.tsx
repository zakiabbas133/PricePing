import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
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
import CustomModal from "../components/CustomModal";
import useGeneratePrice from "../hooks/useGeneratePrice";
import CustomApiLoader from "../components/CustomApiLoader";

type SymbolScreenProps = {
  symbol: string;
  setSymbol: (symbol: string) => void;
};

export type ModalType = "error" | "success" | "warn";

export type ModalContent = {
  title: string;
  description: string;
  type: ModalType;
};

const SymbolScreen = ({ symbol, setSymbol }: SymbolScreenProps) => {
  const insets = useSafeAreaInsets();
  const { price, status, createAlarm } = useGeneratePrice(symbol);

  const [targetInput, setTargetInput] = useState("");
  const [priceError, setPriceError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [modalContent, setModalContent] = useState<ModalContent>({
    title: "",
    description: "",
    type: "success",
  });

  const [direction, setDirection] = useState<"above" | "below">("above");
  const [futureOrSpot, setFutureOrSpot] = useState<"future" | "spot">("future");
  const [creating, setCreating] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);

  const formatPrice = (value: number | null | undefined) => {
    if (value == null || !Number.isFinite(value)) {
      return "—";
    }

    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  };

  const showModal = (
    title: string,
    description: string,
    type: ModalType = "error",
  ) => {
    setModalContent({ title, description, type });
    setModalVisible(true);
  };

  const handleCreateAlarm = async () => {
    if (creating) return;

    const normalizedSymbol = symbol.trim().toUpperCase();
    const normalizedInput = targetInput.trim();
    const target = Number(normalizedInput);

    // Validate empty, invalid, zero, and negative target prices.
    if (!normalizedInput || !Number.isFinite(target) || target <= 0) {
      setPriceError(true);

      showModal(
        "Invalid Target Price",
        "Please enter a valid target price greater than zero.",
      );

      return;
    }

    // Ensure the current market price is available.
    if (price == null || !Number.isFinite(price) || price <= 0) {
      showModal(
        "Price Unavailable",
        "Please wait until the current market price is available, then try again.",
      );

      return;
    }

    // An Above alarm must have a target at or above the current price.
    if (direction === "above" && target < price) {
      setPriceError(true);

      showModal(
        "Invalid Target Price",
        `The target price is below the current ${normalizedSymbol} price. Please raise your target.`,
      );

      return;
    }

    // A Below alarm must have a target at or below the current price.
    if (direction === "below" && target > price) {
      setPriceError(true);

      showModal(
        "Invalid Target Price",
        `The target price is above the current ${normalizedSymbol} price. Please lower your target.`,
      );

      return;
    }

    try {
      setCreating(true);
      setLoadingApi(true);
      await createAlarm(normalizedSymbol, target, direction, futureOrSpot);

      setTargetInput("");
      setPriceError(false);

      showModal(
        "Alarm Created",
        `${normalizedSymbol} alarm created successfully.`,
        "success",
      );

      setLoadingApi(false);
    } catch (error) {
      showModal(
        "Unable to Create Alarm",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
      setLoadingApi(false);
    } finally {
      setCreating(false);
      setLoadingApi(false);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.safeArea}
    >
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
              value={symbol}
              setValue={(value: string) => {
                setSymbol(value.trim().toUpperCase());
                setPriceError(false);
              }}
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
              onChangeText={(value) => {
                setTargetInput(value);
                setPriceError(false);
              }}
              placeholder="92500"
              placeholderTextColor="#98A2B3"
              keyboardType="decimal-pad"
              editable={!creating}
              accessibilityLabel="Target price"
              style={[
                styles.input,
                {
                  borderColor: priceError ? "#F04438" : "#D0D5DD",
                },
              ]}
            />
          </View>

          {/* Direction */}
          <View style={styles.field}>
            <Text style={styles.label}>Direction</Text>

            <View style={styles.directionContainer}>
              {/* Above */}
              <Pressable
                onPress={() => {
                  setDirection("above");
                  setPriceError(false);
                }}
                style={[
                  styles.directionButton,
                  direction === "above" && styles.aboveSelected,
                ]}
              >
                <AntDesign
                  name="arrow-up"
                  size={15}
                  color={direction === "above" ? "#FFFFFF" : "#000000"}
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
                onPress={() => {
                  setDirection("below");
                  setPriceError(false);
                }}
                style={[
                  styles.directionButton,
                  direction === "below" && styles.belowSelected,
                ]}
              >
                <AntDesign
                  name="arrow-down"
                  size={15}
                  color={direction === "below" ? "#FFFFFF" : "#000000"}
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
            activeOpacity={0.8}
            style={[styles.primaryButton, creating && styles.disabledButton]}
          >
            <MaterialCommunityIcons name="bell" size={16} color="#FFFFFF" />

            <Text style={styles.primaryButtonText}>
              {creating ? "Creating..." : "Set Alarm"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Price */}
        <View style={styles.card}>
          <View style={styles.priceHeader}>
            <Text style={styles.currentPriceLabel}>Current Price</Text>

            {/* Replace this placeholder with a real 24-hour change value
                if your price hook provides one. */}
            <Text style={styles.percentageText}>+1.24%</Text>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceValueContainer}>
              <Text style={styles.currentPrice}>
                {status == "connecting" || price == 0
                  ? "—"
                  : formatPrice(price)}
              </Text>

              <Text style={styles.currencyText}>USDT</Text>
            </View>

            <Text style={styles.timeframeText}>(24h)</Text>
          </View>
        </View>

        {/* Connection Status */}
        <View style={styles.connectionCard}>
          <View style={styles.connectionLeft}>
            <View
              style={[
                styles.connectionDot,
                { backgroundColor: getConnectionColor() },
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

      {/* Shared Modal for Validation, Errors, and Success */}
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalContent.title}
        message={modalContent.description}
        icon={
          modalContent.type === "success"
            ? "check-circle-outline"
            : "alert-circle-outline"
        }
        iconColor={modalContent.type === "success" ? "#16A34A" : "#DC2626"}
        confirmText="Okay"
      />
      {loadingApi && <CustomApiLoader />}
    </KeyboardAvoidingView>
  );
};

/**
 * Parent component.
 *
 * Changing the selected symbol remounts SymbolScreen,
 * so useGeneratePrice subscribes to the selected symbol.
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
    backgroundColor: "#FFFFFF",
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
    paddingTop: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1,

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
    borderColor: "#1677FF",
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
    color: "#000000",
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
    color: "#000000",
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

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1,

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
