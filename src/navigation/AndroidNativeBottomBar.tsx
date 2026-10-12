import { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY = "#2B77F1";
const INACTIVE = "#838383";
const ACTIVE_BG = "#c5d6f1";

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
          bottom: insets.bottom + 10,
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
              label={label}
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
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const labelOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

  const getIcon = () => {
    switch (routeName) {
      case "Home":
        return "home";
      case "Alarms":
        return "bell";
      case "Settings":
        return "cog";
      default:
        return "circle";
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1 : 0.95,
        useNativeDriver: true,
        speed: 30,
        bounciness: 6,
      }),
      Animated.timing(labelOpacity, {
        toValue: focused ? 1 : 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  const handlePress = () => {
    scale.setValue(0.9);
    translateY.setValue(2);

    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1 : 0.95,
        useNativeDriver: true,
        speed: 30,
        bounciness: 5,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 30,
        bounciness: 5,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      onLongPress={onLongPress}
      style={styles.tabButton}
    >
      <Animated.View
        style={{
          transform: [{ scale }, { translateY }],
        }}
      >
        <View
          style={[
            styles.tabContent,
            {
              backgroundColor: focused ? ACTIVE_BG : "#fff",
              width: focused ? "100%" : "100%",
            },
          ]}
        >
          <FontAwesome
            name={getIcon()}
            color={focused ? PRIMARY : INACTIVE}
            size={26}
          />

          {focused && (
            <Animated.Text
              style={[
                styles.label,
                {
                  opacity: labelOpacity,
                  color: PRIMARY,
                },
              ]}
            >
              {label}
            </Animated.Text>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    paddingHorizontal: 20,
    width: '100%'
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
    width: "100%",
    borderRadius: 99,
    backgroundColor: "#fff",
    elevation: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.14,
    shadowRadius: 14,
  },

  tabButton: {
    width: "33.3333333%",
  },

  tabContent: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 99,
  },

  activeBackground: {
    alignItems: "center",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 99,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },

  label: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 16,
    color: PRIMARY,
  },
});

export default AndroidNativeBottomBar;
