import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

const themeScript = `
try {
  var key = "multilot-theme";
  var theme = localStorage.getItem(key) || "dark";
  var resolved = theme === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
} catch (_) {
  document.documentElement.classList.add("dark");
  document.documentElement.style.colorScheme = "dark";
}
`;

function ThemeInitScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
}

export const metadata: Metadata = {
  title: "MultiLot 360",
  description: "Plataforma de gestión operativa para loterías.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#080808" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className="dark"
    >
      <body className="font-sans antialiased">
        <ThemeInitScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
