import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PriceAlarm } from "../hooks/useGeneratePrice";
import { coinImages } from "./RenderAlarm";
import { AntDesign, Ionicons } from "@expo/vector-icons";
// import { useState } from "react";
// import { ModalContent, ModalType } from "../screens/Home";
// import CustomDeleteModal from "./CustomDeleteModal";

const RenderPastAlarm = ({
  alarm,
  // deleteAlarm,
}: {
  alarm: PriceAlarm;
  deleteAlarm: (id: number) => void;
}) => {
  // const [modalVisible, setModalVisible] = useState(false);
  // const [modalContent, setModalContent] = useState<ModalContent>({
  //   title: "",
  //   description: "",
  //   type: "warn",
  // });

  // const showModal = (
  //   title: string,
  //   description: string,
  //   type: ModalType = "warn",
  // ) => {
  //   setModalContent({ title, description, type });
  //   setModalVisible(true);
  // };

  // const openDeleteAlarmModal = () => {
  //   showModal(
  //     "Delete Alarm",
  //     `Are you sure you want to delete the alarm?`,
  //     "success",
  //   );
  // };

  const formatPrice = (value: number | null) => {
    if (value === null || value === undefined) {
      return "—";
    }

    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
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
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 15,
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
                {formatPrice(alarm.targetPrice) + " "}
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
          backgroundColor: "#ccc",
          height: 1,
          width: "100%",
          marginVertical: 10,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flex: 1,
            paddingLeft: 15,
          }}
        >
          <View>
            <Text
              style={{
                fontFamily: "Outfit-Medium",
                color: "#626770",
              }}
            >
              Triggered at
            </Text>
            <Text
              style={{
                color: "#626770",
                fontFamily: "Outfit-SemiBold",
                fontSize: 13,
                marginTop: 3,
              }}
            >
              {formatDateTime(alarm?.triggeredAt)}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#ccc",
            height: "100%",
            width: 1,
            marginHorizontal: 10,
          }}
        />

        <View
          style={{
            flex: 1,
            paddingRight: 15,
          }}
        >
          <Text
            style={{
              fontFamily: "Outfit-Medium",
              color: "#626770",
            }}
          >
            Triggered Price
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
                marginTop: 3,
              }}
            >
              {formatPrice(alarm.targetPrice)}
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
          {/* <TouchableOpacity
            onPress={openDeleteAlarmModal}
            style={{
              marginTop: 5,
              alignSelf: "flex-end",
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#B42318" />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* <CustomDeleteModal
        visible={modalVisible}
        onConfirm={async () => {
          setModalVisible(false);
          await deleteAlarm(alarm.id);
        }}
        onCancel={() => setModalVisible(false)}
        title={modalContent.title}
        message={modalContent.description}
      /> */}
    </View>
  );
};

export default RenderPastAlarm;

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
