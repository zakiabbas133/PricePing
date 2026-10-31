import { Dimensions, Modal, Platform, View } from "react-native";
import { BlurView } from "expo-blur";
import LottieView from "lottie-react-native";

const CustomApiLoader = () => {
  const { width, height } = Dimensions.get("screen");

  return (
    <Modal visible={true} transparent animationType="fade">
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={20}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LoaderContent />
        </BlurView>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(16, 24, 40, 0.55)",
          }}
        >
          <LoaderContent />
        </View>
      )}
    </Modal>
  );
};

const LoaderContent = () => (
  <View
    style={{
      backgroundColor: "#fff",
      width: "35%",
      aspectRatio: 1,
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#c0c0c0",
    }}
  >
    <LottieView
      source={require("../../assets/loader.json")}
      style={{ width: "100%", height: "100%" }}
      autoPlay
      loop
    />
  </View>
);

export default CustomApiLoader;
