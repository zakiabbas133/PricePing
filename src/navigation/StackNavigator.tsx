import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AlarmSounds from "../screens/AlarmSounds";
import PricePingTabs from "./TabNavigator";

const Stack = createNativeStackNavigator();

function PricePingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="PricePingTabs" component={PricePingTabs} />
      <Stack.Screen name="AlarmSounds" component={AlarmSounds} />
    </Stack.Navigator>
  );
}

export default PricePingStack;
