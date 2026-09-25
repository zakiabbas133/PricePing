import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/Home";
import Settings from "../screens/Settings";
import Alarms from "../screens/Alarms";
import { FontAwesome } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

function PricePingTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2B77F1",
        tabBarInactiveTintColor: "#626770",
        tabBarLabelStyle: {
          fontFamily: "Outfit-SemiBold",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="home"
              size={24}
              color={focused ? "#2B77F1" : "#626770"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Alarms"
        component={Alarms}
        options={{
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="bell"
              size={24}
              color={focused ? "#2B77F1" : "#626770"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="cog"
              size={24}
              color={focused ? "#2B77F1" : "#626770"}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default PricePingTabs;
