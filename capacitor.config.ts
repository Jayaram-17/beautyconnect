import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env["CAPACITOR_SERVER_URL"];
const config: CapacitorConfig = {
  appId: "com.glowlist.app",
  appName: "Glowlist",
  webDir: ".output/public",
  ...(serverUrl ? { server: {
    url: serverUrl,
    cleartext: false,
    androidScheme: "https",
  } } : {}),
  android: {
    allowMixedContent: false,
  },
};

export default config;
