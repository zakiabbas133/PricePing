import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const data = [
  { label: "BTCUSDT", value: "BTCUSDT" },
  { label: "ETHUSDT", value: "ETHUSDT" },
  { label: "SOLUSDT", value: "SOLUSDT" },
];

const DropdownElement = ({
  setValue,
  value,
}: {
  setValue: (val: string) => void;
  value: string;
}) => {
  //   const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  const renderLabel = () => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: "#444" }]}>
          Currency
        </Text>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {renderLabel()}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: "#c0c0c0" }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        containerStyle={styles.dropdownContainer}
        data={data}
        search={false}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? "Select currency" : ""}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setValue(item.value);
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <FontAwesome5 name="bitcoin" size={24} color="#F7931A" />
        )}
      />
    </View>
  );
};

export default DropdownElement;

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    backgroundColor: "#fff",
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    top: -25,
    borderRadius: 14,
  },
  dropdown: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    color: "#747373",
    left: 41,
    top: -10,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
    fontFamily: "Outfit-Medium",
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#000000",
    marginLeft: 10,
    fontFamily: "Outfit-Regular",
  },
  selectedTextStyle: {
    fontSize: 16,
    marginLeft: 10,
  },
  iconStyle: {},
  inputSearchStyle: {
    // height: 40,
    fontSize: 16,
  },
});
