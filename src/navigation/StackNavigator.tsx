import { NavigationProp } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PriceAlarmWidthoutId } from "../hooks/useGeneratePrice";
import AlarmSounds from "../screens/AlarmSounds";
import PricePingTabs from "./TabNavigator";
import PlayAlarm from "../screens/PlayAlarm";
import PresentPaywall from "../screens/PresentPaywall";

export type RootStackParamList = {
  PricePingTabs: undefined;
  AlarmSounds: undefined;
  PlayAlarm: {
    alarmToSend: PriceAlarmWidthoutId;
  };
  PresentPaywall: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export type Navigation = NavigationProp<RootStackParamList>;

function PricePingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="PricePingTabs"
        component={PricePingTabs}
        options={{
          headerSearchBarOptions: {
            placeholder: "Search fruits",
          },
        }}
      />
      <Stack.Screen name="AlarmSounds" component={AlarmSounds} />
      <Stack.Screen name="PlayAlarm" component={PlayAlarm} />
      <Stack.Screen
        name="PresentPaywall"
        component={PresentPaywall}
        options={{
          presentation: "formSheet",
          sheetGrabberVisible: true,
        }}
      />
    </Stack.Navigator>
  );
}

export default PricePingStack;
