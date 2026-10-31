import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useNetworkState } from "expo-network";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const CheckNetwork = () => {
  const insets = useSafeAreaInsets();
  const networkState = useNetworkState();
  const isOffline =
    !networkState.isConnected || !networkState.isInternetReachable;

  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [bannerHeight, setBannerHeight] = useState(100);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: isOffline ? 0 : -bannerHeight,
        duration: isOffline ? 450 : 350,
        easing: isOffline ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isOffline ? 1 : 0,
        duration: isOffline ? 300 : 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOffline, bannerHeight, translateY, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      onLayout={(event) => {
        const height = event.nativeEvent.layout.height;
        if (height > 0 && height !== bannerHeight) {
          setBannerHeight(height);
        }
      }}
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.banner}>
        <View style={styles.iconContainer}>
          <Feather name="wifi-off" size={24} color="#fff" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>No internet connection</Text>
          <Text style={styles.subtitle}>Check your network and try again</Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>OFFLINE</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 20,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3c8cfc",
    borderColor: "#006aff",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 12,
    shadowColor: "#E64F36",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#006aff",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: "#FF8069",
    fontSize: 29,
    fontWeight: "700",
    lineHeight: 34,
  },
  slash: {
    position: "absolute",
    width: 25,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#FF8069",
    transform: [{ rotate: "-45deg" }],
  },
  textContainer: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: "#FFF5F2",
    fontSize: 14,
    fontFamily: "Outfit-Bold",
  },
  subtitle: {
    color: "#d8d8d8",
    fontSize: 11,
    fontFamily: "Outfit-Regular",
  },
  statusContainer: {
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#f34d34",
  },
  statusText: {
    fontSize: 8,
    fontFamily: "Outfit-Bold",
    color: "#f34d34",
    letterSpacing: 1,
  },
});

export default CheckNetwork;
