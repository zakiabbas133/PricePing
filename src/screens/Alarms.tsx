import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useBinancePriceAlarm from "../hooks/useBinanceBTCPrice";
import { useCallback, useState } from "react";
import RenderAlarm, { AlarmType } from "../components/RenderAlarm";

const Alarms = () => {
  const insets = useSafeAreaInsets();
  const [activeOrPast, setActiveOrPast] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { deleteAlarm, activeAlarms, pastAlarms, refetchActiveAlarms } =
    useBinancePriceAlarm("BTCUSDT");
  const formatPrice = (value: number | null) => {
    if (value === null || value === undefined) {
      return "—";
    }

    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetchActiveAlarms()
      .then(() => {
        setRefreshing(false);
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, []);

  const renderAlarm = (alarm: AlarmType) => {
    const isAbove = alarm.direction === "above";

    return (
      <View
        key={alarm.id}
        style={[styles.alarmCard, alarm.triggered && styles.triggeredAlarm]}
      >
        <View style={styles.alarmTop}>
          <Text style={styles.alarmSymbol}>{alarm.symbol}</Text>

          <View
            style={[styles.badge, alarm.triggered && styles.triggeredBadge]}
          >
            <Text
              style={[
                styles.badgeText,
                alarm.triggered && styles.triggeredBadgeText,
              ]}
            >
              {alarm.triggered ? "Triggered" : "Active"}
            </Text>
          </View>
        </View>

        <View style={styles.alarmDetails}>
          <View style={styles.directionRow}>
            <Text
              style={[
                styles.directionArrow,
                {
                  color: isAbove ? "#16A34A" : "#DC2626",
                },
              ]}
            >
              {isAbove ? (
                <AntDesign name="arrow-up" size={24} color="black" />
              ) : (
                <AntDesign name="arrow-down" size={24} color="black" />
              )}
            </Text>

            <Text style={styles.directionText}>
              {isAbove ? "Above" : "Below"}
            </Text>

            <Text style={styles.alarmPrice}>{formatPrice(alarm.target)}</Text>
          </View>

          {alarm.triggered ? (
            <>
              <Text style={styles.detailText}>
                Triggered Price:{" "}
                <Text style={styles.detailStrong}>
                  {formatPrice(alarm.triggeredPrice)}
                </Text>
              </Text>

              <Text style={styles.detailText}>
                Triggered: {formatDate(alarm.triggeredAt)}
              </Text>
            </>
          ) : (
            <Text style={styles.detailText}>
              Created: {formatDate(alarm.createdAt)}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert("Delete Alarm", `Delete the ${alarm.symbol} alarm?`, [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => deleteAlarm(alarm.id),
              },
            ]);
          }}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.headerTitle}>Alarms</Text>

      <View style={[styles.directionContainer, { marginBottom: 12 }]}>
        <Pressable
          onPress={() => setActiveOrPast("active")}
          style={[
            styles.directionButton,
            activeOrPast === "active" && { backgroundColor: "#2B77F1" },
          ]}
        >
          <Text
            style={[
              styles.directionButtonText,
              activeOrPast === "active" && styles.selectedDirectionText,
            ]}
          >
            Active ({activeAlarms.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveOrPast("past")}
          style={[
            styles.directionButton,
            activeOrPast === "past" && { backgroundColor: "#2B77F1" },
          ]}
        >
          <Text
            style={[
              styles.directionButtonText,
              activeOrPast === "past" && styles.selectedDirectionText,
            ]}
          >
            Past ({pastAlarms.length})
          </Text>
        </Pressable>
      </View>

      {/* Active Alarms */}
      {(activeOrPast == "" || activeOrPast == "active") && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Alarms</Text>
          </View>

          {activeAlarms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="bell" size={32} color="#98A2B3" />

              <Text style={styles.emptyText}>No active alarms</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {activeAlarms.map((alarm) => {
                return (
                  <RenderAlarm
                    key={alarm.id}
                    alarm={alarm}
                    deleteAlarm={() => deleteAlarm(alarm.id)}
                  />
                );
              })}
            </View>
          )}
        </>
      )}

      {(activeOrPast == "" || activeOrPast == "past") && (
        <>
          {/* Past Alarms */}
          <View
            style={[
              styles.sectionHeader,
              {
                marginTop:
                  activeOrPast == "" ? 12 : activeOrPast == "past" ? 0 : 12,
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Past Alarms</Text>
          </View>

          {pastAlarms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="bell" size={32} color="#98A2B3" />

              <Text style={styles.emptyText}>No past alarms</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {pastAlarms.map((alarm) => {
                return (
                  <RenderAlarm
                    key={alarm.id}
                    alarm={alarm}
                    deleteAlarm={() => deleteAlarm(alarm.id)}
                  />
                );
              })}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default Alarms;

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 25,
    fontFamily: "Outfit-Bold",
    color: "#101828",
    marginBottom: 10,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // marginTop: 8,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    color: "#101828",
    fontFamily: "Outfit-Bold",
  },

  countBadge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 7,
    borderRadius: 13,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1677FF",
  },

  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 14,
    paddingVertical: 25,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  emptyIcon: {
    fontSize: 25,
    marginBottom: 7,
  },

  emptyText: {
    fontSize: 14,
    color: "#98A2B3",
    textAlign: "center",
    marginTop: 10,
    fontFamily: "Outfit-Medium",
  },

  directionContainer: {
    flexDirection: "row",
    gap: 10,
  },

  directionButton: {
    flex: 1,
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },

  directionButtonText: {
    fontSize: 15,
    fontFamily: "Outfit-Bold",
    color: "#344054",
  },

  selectedDirectionText: {
    color: "#FFFFFF",
  },

  alarmCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },

  triggeredAlarm: {
    borderColor: "#F04438",
  },

  alarmTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  alarmSymbol: {
    fontSize: 17,
    fontWeight: "700",
    color: "#101828",
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#ECFDF3",
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#027A48",
  },

  triggeredBadge: {
    backgroundColor: "#FEF3F2",
  },

  triggeredBadgeText: {
    color: "#B42318",
  },

  alarmDetails: {
    marginTop: 12,
  },

  directionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  directionArrow: {
    fontSize: 20,
    fontWeight: "700",
    marginRight: 5,
  },

  directionText: {
    fontSize: 14,
    color: "#475467",
    marginRight: 7,
  },

  alarmPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#101828",
  },

  detailText: {
    fontSize: 14,
    lineHeight: 24,
    color: "#475467",
  },

  detailStrong: {
    fontWeight: "700",
    color: "#101828",
  },

  deleteButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingVertical: 4,
  },

  deleteButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F04438",
  },
});
