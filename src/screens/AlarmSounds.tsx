import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import useGeneratePrice from "../hooks/useGeneratePrice";

export type SoundItem = {
  id: string;
  name: string;
  description: string;
  source: any;
};

const SOUNDS: SoundItem[] = [
  {
    id: "sound1",
    name: "Alarm 1",
    description: "Classic alarm tone",
    source: require("../../assets/sounds/alarm1.mp3"),
  },
  {
    id: "sound2",
    name: "Alarm 2",
    description: "Gentle alert",
    source: require("../../assets/sounds/alarm2.mp3"),
  },
];

const AlarmSounds = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { setAlarmSound } = useGeneratePrice();
  const dispatch = useDispatch<AppDispatch>();
  const selectedSound = useSelector(
    (state: RootState) => state.app.selectedSound,
  );
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const currentSound = SOUNDS.find((sound) => sound.id === playingId);
  const player = useAudioPlayer(currentSound?.source ?? SOUNDS[0].source);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
        });
      } catch (error) {
        console.error("Failed to configure audio:", error);
      }
    };

    configureAudio();
  }, []);

  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch {}
    };
  }, [player]);

  useEffect(() => {
    if (
      playingId &&
      status.duration > 0 &&
      status.currentTime >= status.duration
    ) {
      setPlayingId(null);
    }
  }, [status.currentTime, status.duration, playingId]);

  const selectSound = useCallback(
    async (sound: SoundItem) => {
      try {
        setAlarmSound(sound);
      } catch (error) {
        console.error("Failed to save selected sound:", error);
      }
    },
    [dispatch],
  );

  const togglePlayback = useCallback(
    async (sound: SoundItem) => {
      try {
        if (playingId === sound.id) {
          player.pause();
          setPlayingId(null);
          return;
        }

        setLoadingId(sound.id);
        player.replace(sound.source);
        setPlayingId(sound.id);
        player.seekTo(0);
        player.play();
        setLoadingId(null);
      } catch (error) {
        console.error("Failed to play alarm sound:", error);
        setLoadingId(null);
        setPlayingId(null);
      }
    },
    [playingId, player],
  );

  const renderSound = ({ item }: { item: SoundItem }) => {
    const isSelected = selectedSound.id === item.id;
    const isPlaying = playingId === item.id;
    const isLoading = loadingId === item.id;
    const progress =
      isPlaying && status.duration > 0
        ? Math.min(status.currentTime / status.duration, 1)
        : 0;

    return (
      <TouchableOpacity
        onPress={() => selectSound(item as SoundItem)}
        style={[styles.soundCard, isSelected && styles.soundCardSelected]}
      >
        <View style={styles.soundLeft}>
          <View
            style={[styles.soundIcon, isSelected && styles.soundIconSelected]}
          >
            <SimpleLineIcons
              name={isPlaying ? "volume-2" : "music-tone-alt"}
              size={21}
              color={isSelected ? "#1677FF" : "#475467"}
            />
          </View>

          <View style={styles.soundInfo}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.soundName,
                  isSelected && styles.soundNameSelected,
                ]}
              >
                {item.name}
              </Text>

              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Selected</Text>
                </View>
              )}
            </View>

            <Text style={styles.soundDescription}>{item.description}</Text>

            {isPlaying && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${progress * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => togglePlayback(item)}
          style={[styles.playButton, isPlaying && styles.playButtonPlaying]}
          hitSlop={8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#1677FF" />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={19}
              color="#1677FF"
              style={isPlaying ? undefined : { marginLeft: 2 }}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <SimpleLineIcons name="arrow-left" size={20} color="#101828" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Alarm Sounds</Text>
          <Text style={styles.headerSubtitle}>
            Choose the sound used when your price alarm triggers
          </Text>
        </View>
      </View>

      <View style={styles.currentCard}>
        <View style={styles.currentIcon}>
          <Ionicons name="musical-notes" size={20} color="#1677FF" />
        </View>

        <View style={styles.currentInfo}>
          <Text style={styles.currentLabel}>CURRENT SOUND</Text>

          <Text style={styles.currentSound}>
            {SOUNDS.find((sound) => sound.id === selectedSound.id)
              ?.description ?? "Sound 1"}
          </Text>
        </View>

        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Sounds</Text>

        <Text style={styles.sectionCount}>{SOUNDS.length} sounds</Text>
      </View>

      <FlatList
        data={SOUNDS}
        keyExtractor={(item) => item.id}
        renderItem={renderSound}
        contentContainerStyle={[
          {
            paddingBottom: insets.bottom + 5,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

export default AlarmSounds;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    paddingTop: 18,
    paddingBottom: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 25,
    color: "#101828",
    fontFamily: "Outfit-SemiBold",
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#667085",
    fontFamily: "Outfit-Regular",
    marginTop: 3,
    lineHeight: 18,
  },

  currentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#C9DDFF",
    borderRadius: 18,
    padding: 15,
    marginBottom: 25,
  },

  currentIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  currentInfo: {
    flex: 1,
    marginHorizontal: 13,
  },

  currentLabel: {
    fontSize: 10,
    color: "#667085",
    fontFamily: "Outfit-SemiBold",
    letterSpacing: 0.8,
  },

  currentSound: {
    fontSize: 16,
    color: "#101828",
    fontFamily: "Outfit-Medium",
    marginTop: 2,
  },

  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1677FF",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 19,
    color: "#101828",
    fontFamily: "Outfit-SemiBold",
  },

  sectionCount: {
    fontSize: 13,
    color: "#98A2B3",
    fontFamily: "Outfit-Regular",
  },

  // listContent: {
  //   paddingBottom: 30,
  // },

  soundCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 17,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  soundCardSelected: {
    borderColor: "#9FC3FF",
    backgroundColor: "#F8FBFF",
  },

  soundLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  soundIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },

  soundIconSelected: {
    backgroundColor: "#E7F0FF",
  },

  soundInfo: {
    flex: 1,
    marginLeft: 13,
    marginRight: 10,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  soundName: {
    fontSize: 16,
    color: "#344054",
    fontFamily: "Outfit-Medium",
  },

  soundNameSelected: {
    color: "#1677FF",
  },

  selectedBadge: {
    marginLeft: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "#E7F0FF",
  },

  selectedBadgeText: {
    fontSize: 9,
    color: "#1677FF",
    fontFamily: "Outfit-SemiBold",
  },

  soundDescription: {
    fontSize: 12,
    color: "#98A2B3",
    fontFamily: "Outfit-Regular",
    marginTop: 3,
  },

  playButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  playButtonPlaying: {
    backgroundColor: "#DCEAFF",
  },

  progressContainer: {
    marginTop: 9,
    width: "100%",
  },

  progressBackground: {
    height: 3,
    width: "100%",
    backgroundColor: "#E4E7EC",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#1677FF",
    borderRadius: 10,
  },

  separator: {
    height: 10,
  },
});
