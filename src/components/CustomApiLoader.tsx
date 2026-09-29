import { ActivityIndicator, Dimensions, View } from "react-native";

const CustomApiLoader = () => {
  const { width, height } = Dimensions.get("screen");
  return (
    <View
      style={{
        width,
        height,
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffffb4",
      }}
    >
      <ActivityIndicator size={"large"} color={"#1677FF"} />
    </View>
  );
};

export default CustomApiLoader;
