import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StatusBar } from "expo-status-bar";

const AppSplashScreen = ({
  startExitAnimation,
  onAnimationComplete,
}: {
  startExitAnimation: boolean;
  onAnimationComplete: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const bellRotate = useRef(new Animated.Value(0)).current;
  const bellScale = useRef(new Animated.Value(1)).current;

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  const graphOpacity = useRef(new Animated.Value(0)).current;
  const graphScale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    // Intro animation
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 700,
        delay: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 700,
        delay: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(graphOpacity, {
        toValue: 1,
        duration: 900,
        delay: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(graphScale, {
        toValue: 1,
        delay: 350,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous subtle bell animation
    const bellAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bellRotate, {
            toValue: -1,
            duration: 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(bellScale, {
            toValue: 1.06,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),

        Animated.timing(bellRotate, {
          toValue: 1,
          duration: 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(bellRotate, {
          toValue: -0.6,
          duration: 80,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(bellRotate, {
          toValue: 0.4,
          duration: 70,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.parallel([
          Animated.timing(bellRotate, {
            toValue: 0,
            duration: 120,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.spring(bellScale, {
            toValue: 1,
            friction: 5,
            tension: 80,
            useNativeDriver: true,
          }),
        ]),

        Animated.delay(1800),
      ]),
    );

    bellAnimation.start();

    return () => {
      bellAnimation.stop();
    };
  }, []);

  useEffect(() => {
    if (!startExitAnimation) {
      return;
    }

    Animated.parallel([
      // Fade everything out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 650,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),

      // Move splash slightly upward
      Animated.timing(translateY, {
        toValue: -35,
        duration: 650,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),

      // Very subtle scale effect
      Animated.timing(scale, {
        toValue: 1.025,
        duration: 650,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onAnimationComplete?.();
      }
    });
  }, [startExitAnimation]);

  const rotate = bellRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-12deg", "12deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar animated={true} style="light" />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY }, { scale }],
          },
        ]}
      >
        {/* Bell */}
        <Animated.View
          style={{
            transform: [{ rotate }, { scale: bellScale }],
          }}
        >
          <View style={styles.iconGlow}>
            <MaterialCommunityIcons
              name="bell-ring"
              size={115}
              color="#FACA12"
            />
          </View>
        </Animated.View>

        {/* Text */}
        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          }}
        >
          <Text style={styles.title}>Binance Price Alarm</Text>

          <Text style={styles.description}>
            Get notified when your favorite
          </Text>

          <Text style={styles.description}>crypto hits your target price.</Text>
        </Animated.View>

        {/* Graph */}
        <Animated.View
          style={{
            width: "100%",
            opacity: graphOpacity,
            transform: [{ scale: graphScale }],
          }}
        >
          <Image
            style={styles.graph}
            source={require("../../assets/splashscreengraph.png")}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Binance Logo */}
        <Animated.View
          style={{
            opacity: graphOpacity,
          }}
        >
          <Image
            style={styles.binanceLogo}
            source={require("../../assets/binancelogo.png")}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071323",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  content: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  iconGlow: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
  },

  description: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 15,
    marginTop: 2,
    opacity: 0.9,
  },

  graph: {
    width: "100%",
    height: 415,
    marginTop: 5,
  },

  binanceLogo: {
    width: 180,
    height: 40,
    marginTop: 5,
  },
});

export default AppSplashScreen;
