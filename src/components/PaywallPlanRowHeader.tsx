import { Text, View } from "react-native";

const PaywallPlanRowHeader = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: "50%",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontFamily: "Outfit-SemiBold",
          }}
        >
          Features
        </Text>
      </View>
      <View
        style={{
          width: "25%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontFamily: "Outfit-SemiBold",
          }}
        >
          Premium
        </Text>
      </View>
      <View
        style={{
          width: "25%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontFamily: "Outfit-SemiBold",
          }}
        >
          PRO+
        </Text>
      </View>
    </View>
  );
};

export default PaywallPlanRowHeader;
