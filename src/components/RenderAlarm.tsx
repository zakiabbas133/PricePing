import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { PriceAlarm } from "../hooks/useGeneratePrice";

const RenderAlarm = ({
  alarm,
  deleteAlarm,
}: {
  alarm: PriceAlarm;
  deleteAlarm: (id: number) => void;
}) => {
  const coinImages: Record<string, any> = {
    BTCUSDT: require("../../assets/coins/bitcoin.png"),
    ETHUSDT: require("../../assets/coins/ethereum.png"),
    SOLUSDT: require("../../assets/coins/salana.jpg"),
  };

  const showCoin = (symbol: string) => {
    const imgSrc =
      coinImages[symbol] ?? require("../../assets/coins/bitcoin.png");
    return (
      <Image
        style={{
          width: 35,
          height: 35,
        }}
        source={imgSrc}
      />
    );
  };

  const formatPrice = (value: number | null) => {
    if (value === null || value === undefined) {
      return "—";
    }

    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    return `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })} ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
  };

  return (
    <View
      style={{
        borderRadius: 10,
        borderColor: "#ccc",
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
      }}
    >
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
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* <FontAwesome5 name="bitcoin" size={35} color="#F7931A" /> */}
          {showCoin(alarm.symbol)}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Text
                style={{
                  color: "#000000",
                  fontFamily: "Outfit-Medium",
                  fontSize: 16,
                }}
              >
                {alarm.symbol}
              </Text>
              <View
                style={[
                  styles.badge,
                  {
                    paddingVertical: 3,
                    borderWidth: 0,
                    backgroundColor: "#E5F0F7",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      fontSize: 10,
                      color: "#2B77F1",
                    },
                  ]}
                >
                  {alarm.futureOrSpot.charAt(0).toUpperCase() +
                    alarm.futureOrSpot.slice(1)}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                marginTop: 4,
              }}
            >
              <AntDesign
                name={alarm.direction == "above" ? "arrow-up" : "arrow-down"}
                size={16}
                color={alarm.direction == "above" ? "#2DA076" : "#B42318"}
              />
              <Text
                style={{
                  color: alarm.direction == "above" ? "#2DA076" : "#B42318",
                  fontFamily: "Outfit-Regular",
                }}
              >
                {alarm.direction.charAt(0).toUpperCase() +
                  alarm.direction.slice(1)}
              </Text>
              <Text
                style={{
                  fontFamily: "Outfit-Medium",
                  color: "#626770",
                }}
              >
                {formatPrice(alarm.target) + " "}
                <Text
                  style={{
                    color: "#626770",
                    fontFamily: "Outfit-Medium",
                    fontSize: 12,
                  }}
                >
                  USDT
                </Text>
              </Text>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.badge,
            alarm.triggered && styles.triggeredBadge,
            {
              borderColor: alarm.triggered ? "#B42318" : "#027A48",
            },
          ]}
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
      <View
        style={{
          width: "100%",
          height: 1,
          backgroundColor: "#ccc",
          marginTop: 10,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flex: 1,
            padding: 10,
          }}
        >
          <Text
            style={{
              fontFamily: "Outfit-Medium",
              color: "#626770",
            }}
          >
            Initial Price
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              gap: 10,
            }}
          >
            <Text
              style={{
                color: "#000000",
                fontFamily: "Outfit-SemiBold",
                fontSize: 18,
              }}
            >
              {formatPrice(alarm.initialPrice ?? null)}
            </Text>
            <Text
              style={{
                color: "#626770",
                fontFamily: "Outfit-Medium",
                fontSize: 12,
              }}
            >
              USDT
            </Text>
          </View>
        </View>
        <View
          style={{
            width: 1,
            height: "100%",
            backgroundColor: "#ccc",
          }}
        />
        <View
          style={{
            flex: 1,
            padding: 10,
          }}
        >
          <Text
            style={{
              fontFamily: "Outfit-Medium",
              color: "#626770",
            }}
          >
            {alarm.triggered ? "Triggered Price" : "Target Price"}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              gap: 10,
            }}
          >
            <Text
              style={{
                color: "#000000",
                fontFamily: "Outfit-SemiBold",
                fontSize: 18,
                maxWidth: "75%",
              }}
            >
              {formatPrice(alarm.target)}
            </Text>
            <Text
              style={{
                color: "#626770",
                fontFamily: "Outfit-Medium",
                fontSize: 12,
              }}
            >
              USDT
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          width: "100%",
          height: 1,
          backgroundColor: "#ccc",
          marginBottom: 10,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text
            style={{
              color: "#626770",
              fontFamily: "Outfit-Medium",
              fontSize: 12,
            }}
          >
            Set at
          </Text>
          <Text
            style={{
              color: "#626770",
              fontFamily: "Outfit-SemiBold",
              fontSize: 13,
            }}
          >
            {formatDateTime(alarm.createdAt)}
          </Text>
        </View>
        <TouchableOpacity onPress={() => deleteAlarm(alarm.id)}>
          <Ionicons name="trash-outline" size={24} color="#B42318" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RenderAlarm;

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#ECFDF3",
    borderWidth: 1,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#027A48",
    fontFamily: "Outfit-SemiBold",
  },

  triggeredBadge: {
    backgroundColor: "#FEF3F2",
  },

  triggeredBadgeText: {
    color: "#B42318",
  },
});
