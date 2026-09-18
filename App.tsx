import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import PricePingTabs from './src/navigation/TabNavigatior';

export default function App() {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <PricePingTabs />
      </NavigationContainer>
      <StatusBar animated={true} style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
