import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings } from '../../types';

const initialState: AppSettings = {
  currency: 'USD',
  language: 'en',
  theme: 'light',
  notifications: {
    budgetAlerts: true,
    goalMilestones: true,
    transactionAnomalies: true,
    investmentUpdates: true,
    marketNews: false,
  },
  privacy: {
    dataSharing: false,
    analytics: true,
    crashReporting: true,
  },
  security: {
    biometricAuth: false,
    autoLock: true,
    autoLockTimeout: 5,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      return { ...state, ...action.payload };
    },
    updateTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    updateCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    updateLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<AppSettings['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    updatePrivacySettings: (state, action: PayloadAction<Partial<AppSettings['privacy']>>) => {
      state.privacy = { ...state.privacy, ...action.payload };
    },
    updateSecuritySettings: (state, action: PayloadAction<Partial<AppSettings['security']>>) => {
      state.security = { ...state.security, ...action.payload };
    },
    resetSettings: () => initialState,
  },
});

export const {
  updateSettings,
  updateTheme,
  updateCurrency,
  updateLanguage,
  updateNotificationSettings,
  updatePrivacySettings,
  updateSecuritySettings,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;