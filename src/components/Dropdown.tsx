import { useState } from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export const data = [
  {
    label: "BTCUSDT",
    value: "BTCUSDT",
    image: require("../../assets/coins/bitcoin.png"),
  },
  {
    label: "ETHUSDT",
    value: "ETHUSDT",
    image: require("../../assets/coins/ethereum.png"),
  },
  {
    label: "BNBUSDT",
    value: "BNBUSDT",
    image: require("../../assets/coins/bnb.png"),
  },
  {
    label: "SOLUSDT",
    value: "SOLUSDT",
    image: require("../../assets/coins/solana.jpg"),
  },
  {
    label: "XRPUSDT",
    value: "XRPUSDT",
    image: require("../../assets/coins/xrp.png"),
  },
  {
    label: "ADAUSDT",
    value: "ADAUSDT",
    image: require("../../assets/coins/cardano.png"),
  },
  {
    label: "DOGEUSDT",
    value: "DOGEUSDT",
    image: require("../../assets/coins/dogecoin.png"),
  },
  {
    label: "AVAXUSDT",
    value: "AVAXUSDT",
    image: require("../../assets/coins/avalanche.png"),
  },
  {
    label: "LINKUSDT",
    value: "LINKUSDT",
    image: require("../../assets/coins/chainlink.png"),
  },
  {
    label: "DOTUSDT",
    value: "DOTUSDT",
    image: require("../../assets/coins/polkadot.png"),
  },
  {
    label: "TRXUSDT",
    value: "TRXUSDT",
    image: require("../../assets/coins/tron.png"),
  },
  {
    label: "LTCUSDT",
    value: "LTCUSDT",
    image: require("../../assets/coins/litecoin.png"),
  },
  {
    label: "BCHUSDT",
    value: "BCHUSDT",
    image: require("../../assets/coins/bitcoin-cash.png"),
  },
  {
    label: "UNIUSDT",
    value: "UNIUSDT",
    image: require("../../assets/coins/uniswap.png"),
  },
  {
    label: "ATOMUSDT",
    value: "ATOMUSDT",
    image: require("../../assets/coins/cosmos.png"),
  },
  {
    label: "ETCUSDT",
    value: "ETCUSDT",
    image: require("../../assets/coins/ethereum-classic.png"),
  },
  {
    label: "FILUSDT",
    value: "FILUSDT",
    image: require("../../assets/coins/filecoin.png"),
  },
  {
    label: "APTUSDT",
    value: "APTUSDT",
    image: require("../../assets/coins/aptos.png"),
  },
  {
    label: "ARBUSDT",
    value: "ARBUSDT",
    image: require("../../assets/coins/arbitrum.png"),
  },
  {
    label: "OPUSDT",
    value: "OPUSDT",
    image: require("../../assets/coins/optimism.png"),
  },
  {
    label: "SUIUSDT",
    value: "SUIUSDT",
    image: require("../../assets/coins/sui.png"),
  },
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
  const selectedImage =
    data.find((item) => item.value === value)?.image ??
    require("../../assets/coins/bitcoin.png");

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
        containerStyle={[
          styles.dropdownContainer,
          {
            top: Platform.OS == "ios" ? 0 : -25,
          },
        ]}
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
        itemContainerStyle={{ paddingVertical: 10 }}
        renderLeftIcon={() => (
          <Image
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              marginRight: 10,
            }}
            source={selectedImage}
          />
        )}
        renderItem={(data) => {
          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 15,
              }}
            >
              <Image
                style={{ width: 40, height: 40, borderRadius: 999 }}
                source={data.image}
              />

              <Text
                style={{
                  color: "#5e5e5e",
                  fontFamily: "Outfit-Medium",
                }}
              >
                {data.label}
              </Text>
            </View>
          );
        }}
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
    borderRadius: 14,
    maxHeight: 250,
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
    left: 35,
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
    fontFamily: "Outfit-Medium",
    color: "#000",
    // marginLeft: 10,
  },
  iconStyle: {},
  inputSearchStyle: {
    // height: 40,
    fontSize: 16,
  },
});
