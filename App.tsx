import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import AppSplashScreen from "./src/screens/SplashScreen";
import PricePingStack from "./src/navigation/StackNavigator";

export default function App() {
  const [loaded, error] = useFonts({
    "Outfit-Regular": require("./assets/fonts/Outfit-Regular.ttf"),
    "Outfit-SemiBold": require("./assets/fonts/Outfit-SemiBold.ttf"),
    "Outfit-Medium": require("./assets/fonts/Outfit-Medium.ttf"),
    "Outfit-Bold": require("./assets/fonts/Outfit-Bold.ttf"),
  });

  const [splashVisible, setSplashVisible] = useState(true);
  const [startExitAnimation, setStartExitAnimation] = useState(false);

  useEffect(() => {
    if (loaded || error) {
      const timer = setTimeout(() => {
        setStartExitAnimation(true);
      }, 2400);

      return () => clearTimeout(timer);
    }
  }, [loaded, error]);

  if (splashVisible) {
    return (
      <AppSplashScreen
        startExitAnimation={startExitAnimation}
        onAnimationComplete={() => setSplashVisible(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <NavigationContainer>
        {/* <PricePingTabs /> */}
        <PricePingStack />
      </NavigationContainer>

      <StatusBar animated={true} style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
