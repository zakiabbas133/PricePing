import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { setAlarms } from "../store/appSlice";
import RenderAlarm from "../components/RenderAlarm";
import useGeneratePrice from "../hooks/useGeneratePrice";
import getAlarms from "../api/getAlarms";

const Alarms = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.app.userId);
  const { deleteAlarm } = useGeneratePrice();
  const [activeOrPast, setActiveOrPast] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const persistedAlarms = useSelector((state: RootState) => state.app.alarms);
  const pastAlarms = persistedAlarms.filter((x) => x.triggered == true);
  const activeAlarms = persistedAlarms.filter((x) => x.triggered == false);

  const alarmsOnBackend = async () => {
    try {
      const res = await getAlarms(userId || "");
      if(res.success) {
        dispatch(setAlarms(res.data));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    alarmsOnBackend()
      .then(() => {
        setRefreshing(false);
      })
      .catch((err) => {
        console.error(err);
        setRefreshing(false);
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    alarmsOnBackend();
  }, []);

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 20,
          paddingBottom: 20,
          paddingHorizontal: 20,
          backgroundColor: "#fff",
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
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
                {activeAlarms.map((alarm, index) => {
                  return (
                    <RenderAlarm
                      key={index}
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
                {pastAlarms.map((alarm, index) => {
                  return (
                    <RenderAlarm
                      key={index}
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
    </View>
  );
};

export default Alarms;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

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
