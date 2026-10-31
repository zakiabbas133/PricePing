import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const ACTIVE_COLOR = "#fff";
const BAR_COLOR = "#1677FF";
const ICON_COLOR = "#fff";

const AndroidNativeBottomBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingBottom: insets.bottom,
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: "#dddbdb",
        },
      ]}
    >
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <AnimatedTab
              key={route.key}
              routeName={route.name}
              label={options.tabBarAccessibilityLabel ?? label}
              focused={focused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
};

type AnimatedTabProps = {
  routeName: string;
  label: string;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

const AnimatedTab = ({
  routeName,
  label,
  focused,
  onPress,
  onLongPress,
}: AnimatedTabProps) => {
  const focusProgress = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  const getIcon = (): React.ComponentProps<typeof Feather>["name"] => {
    switch (routeName) {
      case "Home":
        return "home";
      case "Alarms":
        return "bell";
      case "Settings":
        return "settings";
      default:
        return "circle";
    }
  };

  useEffect(() => {
    const animation = Animated.spring(focusProgress, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 9,
    });

    animation.start();

    return () => animation.stop();
  }, [focusProgress, focused]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(pressScale, {
        toValue: 0.84,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.spring(pressScale, {
        toValue: 1,
        speed: 24,
        bounciness: 10,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableOpacity
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      activeOpacity={1}
      onPress={handlePress}
      onLongPress={onLongPress}
      style={styles.tabButton}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.activeCircle,
          {
            opacity: focusProgress,
            transform: [
              {
                translateY: focusProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
              {
                scale: focusProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.55, 1],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={{
          alignItems: "center",
          transform: [
            { scale: pressScale },
            {
              translateY: focusProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -1],
              }),
            },
          ],
        }}
      >
        <Feather
          name={getIcon()}
          size={focused ? 24 : 24}
          color={focused ? ACTIVE_COLOR : "#000"}
          style={{
            top: focused ? -22 : 0,
          }}
        />
        <Text
          style={{
            color: focused ? "#1677FF" : "#000",
            fontFamily: "Outfit-Medium",
            bottom: focused ? 2 : 0
          }}
        >
          {routeName}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2.8,
    elevation: 20,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  activeCircle: {
    position: "absolute",
    top: -25,
    width: 50,
    height: 50,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1677FF",
  },
});

export default AndroidNativeBottomBar;
