import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hybridtradeai.app',
  appName: 'HybridTradeAI',
  webDir: 'capacitor-build',
  server: {
    url: 'https://hybrid-trade-ai.vercel.app', // UPDATE THIS to your actual production URL
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
