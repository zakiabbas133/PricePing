import { Ionicons, Octicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

const PaywallPlanRowHeaderBody = ({
  feature,
  premium,
  pro,
}: {
  feature: string;
  premium: boolean;
  pro: boolean;
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10
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
            fontFamily: "Outfit-SemiBold",
          }}
        >
          {feature}
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
          {premium ? (
            <Ionicons name="checkmark-circle-outline" size={28} color="#fff" />
          ) : (
            <Octicons name="dash" size={28} color="#fff" />
          )}
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
          {pro ? (
            <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
          ) : (
            <Octicons name="dash" size={24} color="#fff" />
          )}
        </Text>
      </View>
    </View>
  );
};

export default PaywallPlanRowHeaderBody;
