import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reporttracker.app',
  appName: 'ReportTracker',
  webDir: 'out',
  server: {
    // androidScheme: 'https'
    url: 'http://192.168.0.116:3000',
    cleartext: true     
  }
};

export default config;
