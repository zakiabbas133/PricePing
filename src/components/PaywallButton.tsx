import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

const PaywallButton = ({
  title,
  price,
  checked,
  setSelectedPlan,
}: {
  title: string;
  price: number;
  checked: boolean;
  setSelectedPlan: (selectedPlan: number) => void;
}) => {
  const selectPlan = () => {
    if (title == "Weekly") {
      setSelectedPlan(1);
    } else if (title == "Monthly") {
      setSelectedPlan(2);
    } else {
      setSelectedPlan(3);
    }
  };

  return (
    <TouchableOpacity
			activeOpacity={1}
      onPress={selectPlan}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: checked ? "#fff" : "#2B77F1",
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Ionicons
        name={checked ? "radio-button-on" : "radio-button-off"}
        size={24}
        color={checked ? "#2B77F1" : "#fff"}
      />
      <View
        style={{
          flex: 1,
        }}
      >
        <Text
          style={{
            color: checked ? "#000" : "#fff",
            fontFamily: "Outfit-Medium",
            fontSize: 18,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: checked ? "#666" : "#e7e7e7",
            fontFamily: "Outfit-Medium",
            marginTop: 3,
          }}
        >
          Rs. {price}/-
        </Text>
      </View>
      <Text
        style={{
          color: checked ? "#666" : "#e7e7e7",
          fontFamily: "Outfit-Medium",
          fontSize: 16,
        }}
      >
        Rs. {price} / {title}
      </Text>
    </TouchableOpacity>
  );
};

export default PaywallButton;
