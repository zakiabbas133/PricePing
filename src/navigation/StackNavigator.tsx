import { NavigationProp } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PriceAlarmWidthoutId } from "../hooks/useGeneratePrice";
import AlarmSounds from "../screens/AlarmSounds";
import PricePingTabs from "./TabNavigator";
import PlayAlarm from "../screens/PlayAlarm";

export type RootStackParamList = {
  PricePingTabs: undefined;
  AlarmSounds: undefined;
  PlayAlarm: {
    alarmToSend: PriceAlarmWidthoutId;
  };
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
      <Stack.Screen name="PricePingTabs" component={PricePingTabs} />
      <Stack.Screen name="AlarmSounds" component={AlarmSounds} />
      <Stack.Screen name="PlayAlarm" component={PlayAlarm} />
    </Stack.Navigator>
  );
}

export default PricePingStack;
