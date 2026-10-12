import { ActivityIndicator, Dimensions, Platform, View } from "react-native";
import { BlurView } from "expo-blur";

const CustomApiLoader = () => {
  const { width, height } = Dimensions.get("screen");
  return Platform.OS == "ios" ? (
    <BlurView
      intensity={20}
      style={{
        width,
        height,
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size={"large"} color={"#1677FF"} />
    </BlurView>
  ) : (
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
