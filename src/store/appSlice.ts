import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { PriceAlarm } from "../hooks/useGeneratePrice";

export type AlarmSettings = {
  sound: boolean;
  notifications: boolean;
};

export type SelectedSound = {
  id: string;
  soundName: string;
  fileName: string;
  fileFullName: string;
};

export type AppSliceState = {
  alarms: PriceAlarm[];
  alarmSettings: AlarmSettings;
  selectedSound: SelectedSound;
  volume: number;
  userId: string;
};

const initialState: AppSliceState = {
  alarms: [],
  alarmSettings: {
    sound: true,
    notifications: true,
  },
  selectedSound: {
    id: "sound1",
    soundName: "Classic Alarm Tone",
    fileName: "sound1",
    fileFullName: "sound1.mp3",
  },
  volume: 0,
  userId: "",
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAlarms: (state, action: PayloadAction<PriceAlarm[]>) => {
      state.alarms = action.payload;
    },

    deleteSelectedAlarm: (state, action: PayloadAction<number>) => {
      state.alarms = state.alarms.filter(
        (alarm) => alarm.id !== action.payload,
      );
    },

    setAlarmSettings: (state, action: PayloadAction<AlarmSettings>) => {
      state.alarmSettings = action.payload;
    },

    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.alarmSettings.sound = action.payload;
    },

    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.alarmSettings.notifications = action.payload;
    },

    setSelectedSound: (state, action: PayloadAction<SelectedSound>) => {
      state.selectedSound = action.payload;
    },

    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },

    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
  },
});

export const {
  setAlarms,
  deleteSelectedAlarm,
  setAlarmSettings,
  setSoundEnabled,
  setNotificationsEnabled,
  setSelectedSound,
  setVolume,
  setUserId,
} = appSlice.actions;

export default appSlice.reducer;
