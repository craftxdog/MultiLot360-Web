const requiredEnv = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "MultiLot 360",
  appUrl: requiredEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3001"),
  apiUrl: requiredEnv("NEXT_PUBLIC_API_URL", "http://localhost:3000"),
  realtimeUrl: new URL(
    requiredEnv("NEXT_PUBLIC_API_URL", "http://localhost:3000"),
  ).origin,
};
