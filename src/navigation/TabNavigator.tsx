import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeBottomTabNavigator } from "@react-navigation/bottom-tabs/unstable";
import Home from "../screens/Home";
import Settings from "../screens/Settings";
import Alarms from "../screens/Alarms";
import AndroidNativeBottomBar from "./AndroidNativeBottomBar";

const NativeTab = createNativeBottomTabNavigator();
const BottomTab = createBottomTabNavigator();

function IOSPricePingTabs() {
  return (
    <NativeTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2B77F1",
        tabBarInactiveTintColor: "#626770"
      }}
    >
      <NativeTab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: {
            type: "sfSymbol",
            name: "house",
          },
        }}
      />

      <NativeTab.Screen
        name="Alarms"
        component={Alarms}
        options={{
          tabBarIcon: {
            type: "sfSymbol",
            name: "bell",
          },
        }}
      />

      <NativeTab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: {
            type: "sfSymbol",
            name: "gearshape",
          },
        }}
      />
    </NativeTab.Navigator>
  );
}

function AndroidPricePingTabs() {
  return (
    <BottomTab.Navigator
      tabBar={(props) => <AndroidNativeBottomBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <BottomTab.Screen name="Home" component={Home} />
      <BottomTab.Screen name="Alarms" component={Alarms} />
      <BottomTab.Screen name="Settings" component={Settings} />
    </BottomTab.Navigator>
  );
}

function PricePingTabs() {
  return Platform.OS === "ios" ? (
    <IOSPricePingTabs />
  ) : (
    <AndroidPricePingTabs />
  );
}

export default PricePingTabs;
