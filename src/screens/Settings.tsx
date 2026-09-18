import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import useBinancePriceAlarm from "../hooks/useBinanceBTCPrice";

const Settings = () => {
  const {
    settings,
    permissionGranted,
    setSoundEnabled,
    setNotificationsEnabled,
    requestPermissions,
  } = useBinancePriceAlarm("BTCUSDT");

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
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Alarm Preferences</Text>

      <View style={styles.settingRow}>
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

      <View style={styles.settingRow}>
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

      {settings.notifications && !permissionGranted && (
        <Text style={styles.warningText}>
          Notification permission is not currently granted.
        </Text>
      )}
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#101828",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#101828",
  },

  settingRow: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EAECF0",
    paddingVertical: 12,
  },

  settingInfo: {
    flex: 1,
    paddingRight: 15,
  },

  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#101828",
  },

  settingDescription: {
    fontSize: 12,
    color: "#667085",
    marginTop: 4,
    lineHeight: 17,
  },

  warningText: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 17,
    color: "#B42318",
  },
});
