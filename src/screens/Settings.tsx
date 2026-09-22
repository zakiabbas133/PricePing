import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Foundation,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import useBinancePriceAlarm from "../hooks/useBinanceBTCPrice";
import Slider from "@react-native-community/slider";
import { useState } from "react";

const Settings = ({ navigation }: any) => {
  const {
    settings,
    permissionGranted,
    setSoundEnabled,
    setNotificationsEnabled,
    requestPermissions,
  } = useBinancePriceAlarm("BTCUSDT");

  const [volume, setVolume] = useState("0");
  const [showVolume, setShowVolume] = useState(false);

  const insets = useSafeAreaInsets();

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!enabled) {
      await setNotificationsEnabled(false);
      return;
    }

    try {
      const granted = await requestPermissions();

      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications from your device settings.",
        );

        await setNotificationsEnabled(false);

        return;
      }

      await setNotificationsEnabled(true);
    } catch (error) {
      console.error("Notification permission error:", error);

      await setNotificationsEnabled(false);

      Alert.alert("Notification Error", "Unable to enable notifications.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top + 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}
      // refreshControl={
      //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      // }
    >
      <Text style={styles.sectionTitle}>Active Preferences</Text>

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => {
            navigation.navigate("AlarmSounds");
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <SimpleLineIcons name="music-tone-alt" size={24} color="black" />
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={{
                  color: "#626770",
                  fontSize: 17,
                  fontFamily: "Outfit-Medium",
                }}
              >
                Alarm Sound
              </Text>
              <Text
                style={{
                  color: "#626770",
                  fontFamily: "Outfit-Regular",
                }}
              >
                Default (Birds)
              </Text>
            </View>
            <SimpleLineIcons name="arrow-right" size={16} color="black" />
          </View>
        </TouchableOpacity>

        <View
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "#ccc",
          }}
        />

        <TouchableOpacity
          activeOpacity={1}
          style={styles.settingRow}
          onPress={() => setShowVolume(true)}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <SimpleLineIcons name="volume-2" size={24} color="black" />
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={{
                  color: "#626770",
                  fontSize: 17,
                  fontFamily: "Outfit-Medium",
                }}
              >
                Volume
              </Text>
              <Text
                style={{
                  color: "#626770",
                  fontFamily: "Outfit-Regular",
                }}
              >
                {(Number(volume) * 100).toFixed()}%
              </Text>
            </View>

            <SimpleLineIcons name="arrow-right" size={16} color="black" />

            {showVolume && (
              <View
                style={{
                  backgroundColor: "#fff",
                  position: "absolute",
                  right: 0,
                  borderRadius: 99,
                  paddingHorizontal: 5,
                  paddingVertical: 10,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.18,
                  shadowRadius: 1.0,
                  elevation: 2,
                  width: "50%",
                }}
              >
                <Slider
                  style={{ width: "100%" }}
                  minimumValue={0}
                  maximumValue={1}
                  minimumTrackTintColor="#c0c0c0"
                  maximumTrackTintColor="#ccc"
                  thumbSize={20}
                  thumbTintColor="#2B77F1"
                  value={Number(volume)}
                  onValueChange={(val) => {
                    setVolume(val.toString());
                  }}
                  onTouchEnd={() => {
                    setShowVolume(false);
                  }}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "#ccc",
          }}
        />

        <View style={styles.settingRow}>
          <SimpleLineIcons name="volume-2" size={24} color="black" />
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Alarm Sound</Text>

            <Text style={styles.settingDescription}>
              Play sound when price is reached
            </Text>
          </View>

          <Switch
            value={settings.sound}
            onValueChange={setSoundEnabled}
            trackColor={{
              false: "#D0D5DD",
              true: "#AFC9FF",
            }}
            thumbColor={settings.sound ? "#1677FF" : "#F4F4F5"}
          />
        </View>

        <View
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "#ccc",
          }}
        />

        <View style={styles.settingRow}>
          <SimpleLineIcons name="bell" size={24} color="black" />
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Notifications</Text>

            <Text style={styles.settingDescription}>
              Show notification when price is reached
            </Text>
          </View>

          <Switch
            value={settings.notifications}
            onValueChange={handleNotificationToggle}
            trackColor={{
              false: "#D0D5DD",
              true: "#AFC9FF",
            }}
            thumbColor={settings.notifications ? "#1677FF" : "#F4F4F5"}
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Price Source</Text>

      <View style={styles.card}>
        <TouchableOpacity style={styles.settingRow}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <MaterialCommunityIcons
              name="bullseye-arrow"
              size={24}
              color="black"
            />
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={{
                  color: "#626770",
                  fontSize: 17,
                  fontFamily: "Outfit-Medium",
                }}
              >
                Market Type
              </Text>
              <Text
                style={{
                  color: "#626770",
                  fontFamily: "Outfit-Regular",
                }}
              >
                Futures
              </Text>
            </View>
            <SimpleLineIcons name="arrow-right" size={16} color="black" />
          </View>
        </TouchableOpacity>

        <View
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "#ccc",
          }}
        />

        <View style={styles.settingRow}>
          <Text
            style={{
              color: "#626770",
              fontFamily: "Outfit-Regular",
              marginLeft: 40,
            }}
          >
            Futures provides more accurate prices for perpetual contracts (e.g. BTCUSDT).
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>App Info</Text>

      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <SimpleLineIcons name="info" size={24} color="black" />
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={{
                  color: "#626770",
                  fontSize: 17,
                  fontFamily: "Outfit-Medium",
                }}
              >
                About
              </Text>
              <Text
                style={{
                  color: "#626770",
                  fontFamily: "Outfit-Regular",
                }}
              >
                Version 1.0.0
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "#ccc",
          }}
        />

        <TouchableOpacity style={styles.settingRow}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <SimpleLineIcons name="notebook" size={24} color="black" />
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={{
                  color: "#626770",
                  fontSize: 17,
                  fontFamily: "Outfit-Medium",
                }}
              >
                Binance WebSocket Info
              </Text>
              <Text
                style={{
                  color: "#626770",
                  fontFamily: "Outfit-Regular",
                }}
              >
                Learn more about the data source
              </Text>
            </View>
            <SimpleLineIcons name="arrow-right" size={16} color="black" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.cardWithoutShadow}>
        <View style={styles.settingRow}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              marginLeft: 4,
            }}
          >
            <SimpleLineIcons name="info" size={16} color="black" />
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={{
                  color: "#626770",
                  fontFamily: "Outfit-Regular",
                  marginLeft: 4,
                }}
              >
                This app uses Binance’s public market data and does not require
                an API key. It is not associated with or endorsed by Binance.
              </Text>
            </View>
          </View>
        </View>
      </View>
      {settings.notifications && !permissionGranted && (
        <Text style={styles.warningText}>
          Notification permission is not currently granted.
        </Text>
      )}
    </ScrollView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
    marginTop: 10,
  },

  cardWithoutShadow: {
    backgroundColor: "#E5F0F7",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },

  sectionTitle: {
    fontSize: 20,
    fontFamily: "Outfit-SemiBold",
    color: "#101828",
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
  },

  settingInfo: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 17,
    fontFamily: "Outfit-Medium",
    color: "#626770",
  },

  settingDescription: {
    color: "#626770",
    fontFamily: "Outfit-Regular",
  },

  warningText: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 17,
    color: "#B42318",
  },
});
