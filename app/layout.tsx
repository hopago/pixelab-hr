import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
// Self-host Pretendard via npm package — no render-blocking CDN, no FOUT
import "pretendard/dist/web/variable/pretendardvariable.css";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pixelab HR",
    template: "%s · Pixelab HR",
  },
  description: "픽셀랩성형외과의원 인사 관리",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  applicationName: "Pixelab HR",
  authors: [{ name: "Pixelab Beauty Clinic" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
