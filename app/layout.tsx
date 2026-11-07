import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import MotionProvider from "@/components/motion/MotionProvider";
import FlowerBackdrop from "@/components/FlowerBackdrop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Yabes — Table Decor Management & Deal Recap",
  description: "Platform Manajemen Rekap Deal Event & Master Inventaris Table Decor",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    title: "Yabes Atelier",
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4A3E85",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#4A3E85" />
        <meta name="background-color" content="#FAF9F6" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col text-[#2D2A3E] font-sans selection:bg-[#FFEDA8] selection:text-[#2D2A3E]">
        <AuthProvider>
          <MotionProvider>
            <FlowerBackdrop />
            {children}
            <Script id="pwa-register" strategy="afterInteractive">
              {`
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(function(reg) {
                      if (reg.waiting) reg.waiting.postMessage({ action: 'SKIP_WAITING' });
                    });
                  });
                  navigator.serviceWorker.addEventListener('controllerchange', function() {
                    window.location.reload();
                  });
                }
              `}
            </Script>
          </MotionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
