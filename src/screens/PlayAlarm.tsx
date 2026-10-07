import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAudioPlayer } from "expo-audio";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Navigation, RootStackParamList } from "../navigation/StackNavigator";
import { data } from "../components/Dropdown";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

const { width, height } = Dimensions.get("screen");

type PlayAlarmProps = NativeStackScreenProps<RootStackParamList, "PlayAlarm">;

const PlayAlarm = ({ route }: PlayAlarmProps) => {
  const alarm = route?.params?.alarmToSend;
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const selectedImage =
    data.find((item) => item.value === alarm?.symbol)?.image ??
    require("../../assets/coins/bitcoin.png");
  const alarmPlayer = useAudioPlayer(require("../../assets/sounds/alarm1.mp3"));

  const pulse = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  const glow = useRef(new Animated.Value(0.5)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  const floating1 = useRef(new Animated.Value(0)).current;
  const floating2 = useRef(new Animated.Value(0)).current;
  const floating3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(pulse2, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse2, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(pulse3, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse3, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1.08,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.35,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const floatingAnimation = (value: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: -25,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 25,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    floatingAnimation(floating1, 0);
    floatingAnimation(floating2, 400);
    floatingAnimation(floating3, 800);
  }, []);

  useEffect(() => {
    alarmPlayer.loop = true;
    alarmPlayer.volume = 1;
    alarmPlayer.play();

    return () => {};
  }, [alarmPlayer]);

  const stopAlarm = () => {
    try {
      alarmPlayer.pause();
      alarmPlayer.seekTo(0);
    } catch (error) {
      console.error("Audio stop error:", error);
    }
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "PricePingTabs",
        },
      ],
    });
  };

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.7],
  });

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0.45, 0.25, 0],
  });

  const pulse2Scale = pulse2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.7],
  });

  const pulse2Opacity = pulse2.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0.4, 0.2, 0],
  });

  const pulse3Scale = pulse3.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.7],
  });

  const pulse3Opacity = pulse3.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0.35, 0.15, 0],
  });

  return (
    <ImageBackground
      source={{
        uri: "https://plus.unsplash.com/premium_photo-1676497581000-763997b7c457?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      }}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.overlay}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top,
              // paddingBottom: insets.bottom + (Platform.OS === "ios" ? 0 : 20),
            },
          ]}
        >
          <View style={styles.topBar}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>PRICE ALARM</Text>
            </View>

            <View style={styles.bellContainer}>
              <Ionicons name="notifications" size={21} color="#ffffff" />
            </View>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.alarmTriggered}>TARGET REACHED</Text>
            <Text style={styles.title}>Your alarm is ringing</Text>
            <Text style={styles.subtitle}>
              {alarm?.symbol || "BTCUSDT"} has reached your target price
            </Text>
          </View>

          <View style={styles.alarmArea}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseScale }],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.pulseRing,
                styles.pulseRingSecond,
                {
                  opacity: pulse2Opacity,
                  transform: [{ scale: pulse2Scale }],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.pulseRing,
                styles.pulseRingThird,
                {
                  opacity: pulse3Opacity,
                  transform: [{ scale: pulse3Scale }],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.iconGlow,
                {
                  opacity: glow,
                  transform: [{ scale: iconScale }],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.coinContainer,
                {
                  transform: [{ scale: iconScale }],
                },
              ]}
            >
              <Image
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 999,
                }}
                source={selectedImage}
              />

              <View style={styles.alertBadge}>
                <Ionicons name="notifications" size={18} color="#ffffff" />
              </View>
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.particle,
              styles.particleOne,
              {
                transform: [{ translateY: floating1 }],
              },
            ]}
          >
            <View style={styles.particleDot} />
          </Animated.View>

          <Animated.View
            style={[
              styles.particle,
              styles.particleTwo,
              {
                transform: [{ translateY: floating2 }],
              },
            ]}
          >
            <View style={styles.particleDotSmall} />
          </Animated.View>

          <Animated.View
            style={[
              styles.particle,
              styles.particleThree,
              {
                transform: [{ translateY: floating3 }],
              },
            ]}
          >
            <View style={styles.particleDot} />
          </Animated.View>

          <View style={styles.priceCard}>
            <View style={styles.priceHeader}>
              <View style={styles.symbolContainer}>
                <Image
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                  }}
                  source={selectedImage}
                />

                <Text style={styles.symbol}>{alarm?.symbol || "BTCUSDT"}</Text>
              </View>

              <View style={styles.reachedBadge}>
                <Ionicons name="checkmark-circle" size={15} color="#5CFFB0" />
                <Text style={styles.reachedText}>REACHED</Text>
              </View>
            </View>

            <View style={styles.priceSection}>
              <Text style={styles.currentLabel}>TARGET REACHED</Text>
              <Text style={styles.currentPrice}>
                ${alarm?.targetPrice?.toFixed(2) || 84500}
              </Text>

              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Initially</Text>
                <Text
                  style={[
                    styles.targetPrice,
                    {
                      color:
                        alarm?.direction == "above" ? "#5CFFB0" : "#fa1717",
                    },
                  ]}
                >
                  ${alarm?.initialPrice?.toFixed(2) || 85000}
                </Text>
                <Ionicons
                  name={alarm?.direction == "above" ? "arrow-up" : "arrow-down"}
                  size={16}
                  color={alarm?.direction == "above" ? "#5CFFB0" : "#fa1717"}
                />
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
              <View style={styles.progressDot} />
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="volume-high" size={20} color="#ffffff" />

              <View>
                <Text style={styles.infoLabel}>SOUND</Text>
                <Text style={styles.infoValue}>Alarm 1</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#ffffff" />

              <View>
                <Text style={styles.infoLabel}>STATUS</Text>
                <Text style={styles.infoValue}>Triggered</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={stopAlarm}
          style={[
            styles.stopButton,
            {
              marginBottom:
                Platform.OS == "ios" ? insets.bottom : insets.bottom + 20,
            },
          ]}
        >
          <View style={styles.stopIcon}>
            <Ionicons name="stop" size={22} color="#ffffff" />
          </View>

          <View style={styles.stopTextContainer}>
            <Text style={styles.stopText}>STOP ALARM</Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={24}
            color="#ffffff"
            style={styles.stopArrow}
          />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default PlayAlarm;

const styles = StyleSheet.create({
  background: {
    width,
    height,
    flex: 1,
    backgroundColor: "#000",
  },

  overlay: {
    flex: 1,
    backgroundColor: "#00000060",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FF4B4B",
    marginRight: 7,
  },

  liveText: {
    color: "#ffffff",
    fontFamily: "Outfit-Medium",
    fontSize: 11,
    letterSpacing: 1.2,
  },

  bellContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  titleContainer: {
    alignItems: "center",
    marginTop: 25,
  },

  alarmTriggered: {
    color: "#5CFFB0",
    fontFamily: "Outfit-Medium",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 7,
  },

  title: {
    color: "#ffffff",
    fontFamily: "Outfit-Medium",
    fontSize: 29,
    textAlign: "center",
  },

  subtitle: {
    color: "rgba(255,255,255,0.65)",
    fontFamily: "Outfit-Regular",
    fontSize: 14,
    marginTop: 7,
    textAlign: "center",
  },

  alarmArea: {
    paddingVertical: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  pulseRing: {
    position: "absolute",
    width: 115,
    height: 115,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#F7931A",
  },

  pulseRingSecond: {
    borderColor: "#FFB84D",
  },

  pulseRingThird: {
    borderColor: "#F7931A",
  },

  iconGlow: {
    position: "absolute",
    width: 145,
    height: 145,
    borderRadius: 75,
    backgroundColor: "rgba(247,147,26,0.13)",
    shadowColor: "#F7931A",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 40,
    elevation: 20,
  },

  coinContainer: {
    width: 125,
    height: 125,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,18,28,0.95)",
    borderWidth: 1,
    borderColor: "rgba(247,147,26,0.45)",
    shadowColor: "#F7931A",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 15,
  },

  alertBadge: {
    position: "absolute",
    right: -2,
    top: 2,
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#F12B2B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#10131D",
  },

  particle: {
    position: "absolute",
  },

  particleOne: {
    top: 270,
    left: 45,
  },

  particleTwo: {
    top: 325,
    right: 42,
  },

  particleThree: {
    top: 390,
    left: 70,
  },

  particleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F7931A",
    opacity: 0.7,
  },

  particleDotSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#5CFFB0",
    opacity: 0.7,
  },

  priceCard: {
    backgroundColor: "rgba(16,20,31,0.88)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 18,
    marginTop: 4,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 10,
  },

  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  symbolContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  symbol: {
    color: "#ffffff",
    fontFamily: "Outfit-Medium",
    fontSize: 15,
    marginLeft: 7,
  },

  reachedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(92,255,176,0.10)",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  reachedText: {
    color: "#5CFFB0",
    fontFamily: "Outfit-Medium",
    fontSize: 9,
    letterSpacing: 0.8,
    marginLeft: 4,
  },

  priceSection: {
    alignItems: "center",
    paddingVertical: 17,
  },

  currentLabel: {
    color: "rgba(255,255,255,0.45)",
    fontFamily: "Outfit-Medium",
    fontSize: 10,
    letterSpacing: 1.3,
  },

  currentPrice: {
    color: "#ffffff",
    fontFamily: "Outfit-Medium",
    fontSize: 36,
    marginTop: 2,
  },

  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  targetLabel: {
    color: "rgba(255,255,255,0.45)",
    fontFamily: "Outfit-Regular",
    fontSize: 12,
  },

  targetPrice: {
    color: "#5CFFB0",
    fontFamily: "Outfit-Medium",
    fontSize: 13,
    marginLeft: 5,
    marginRight: 3,
  },

  progressTrack: {
    height: 4,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "visible",
    position: "relative",
  },

  progressFill: {
    height: 4,
    width: "100%",
    borderRadius: 4,
    backgroundColor: "#5CFFB0",
  },

  progressDot: {
    position: "absolute",
    right: -2,
    top: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#5CFFB0",
    shadowColor: "#5CFFB0",
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 16,
    paddingVertical: 13,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },

  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  infoLabel: {
    color: "rgba(255,255,255,0.4)",
    fontFamily: "Outfit-Medium",
    fontSize: 8,
    letterSpacing: 1,
    marginLeft: 8,
  },

  infoValue: {
    color: "#ffffff",
    fontFamily: "Outfit-Medium",
    fontSize: 12,
    marginLeft: 8,
    marginTop: 2,
  },

  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    backgroundColor: "#F12B2B",
    borderRadius: 18,
    padding: 12,
    marginHorizontal: 20,
    shadowColor: "#F12B2B",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },

  stopIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.16)",
  },

  stopTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  stopText: {
    color: "#ffffff",
    fontFamily: "Outfit-Medium",
    fontSize: 17,
    letterSpacing: 0.5,
  },

  stopArrow: {
    marginRight: 5,
  },
});
