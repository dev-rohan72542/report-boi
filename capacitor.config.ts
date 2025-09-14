import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reporttracker.app',
  appName: 'ReportTracker',
  webDir: 'out',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '<YOUR_WEB_APP_CLIENT_ID_FROM_GOOGLE_CLOUD>',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
