import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hoardy.vercel.app"
  ),
  title: "Hoardy | 나를 연구하는 작은 인류학",
  icons: {
    apple: "/hoardy_assets/hoardy_idle.png",
  },
  description:
    "흩어진 지식을 소화하여 자산으로 만드는 당신의 세컨드 브레인.",
  openGraph: {
    title: "Hoardy | 나를 연구하는 작은 인류학",
    description:
      "흩어진 지식을 소화하여 자산으로 만드는 당신의 세컨드 브레인.",
    images: [{ url: "/hoardy_assets/hoardy_idle.png", width: 512, height: 512 }],
    type: "website",
    locale: "ko_KR",
    siteName: "Hoardy",
  },
  twitter: {
    card: "summary",
    title: "Hoardy | 나를 연구하는 작은 인류학",
    description:
      "흩어진 지식을 소화하여 자산으로 만드는 당신의 세컨드 브레인.",
    images: ["/hoardy_assets/hoardy_idle.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Hoardy",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#98ff98",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
