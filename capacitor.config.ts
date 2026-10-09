import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "cn.sonora.noisemonitor",
  appName: "声境",
  webDir: "dist",
  backgroundColor: "#f7f8f4",
  server: {
    // Serve bundled assets from a secure local origin; no development server required.
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#f7f8f4",
    allowMixedContent: false,
  },
  plugins: {
    SystemBars: { insetsHandling: "native", style: "LIGHT" },
  },
};

export default config;
