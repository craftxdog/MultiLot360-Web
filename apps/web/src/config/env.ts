const publicApiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "MultiLot 360",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
  apiUrl: publicApiUrl,
  realtimeUrl: new URL(publicApiUrl).origin,
};
