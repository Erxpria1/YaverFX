import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YaverFX",
  description: "Odak & Üretkenlik Uygulaması",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

import { TimerProvider } from "./context/TimerContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" data-theme="modern">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="YaverFX" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased">
        <TimerProvider>
          {children}
        </TimerProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Set app title from localStorage or default
              (function() {
                var appName = localStorage.getItem('yaverfx-app-name') || 'Kerem';
                document.title = appName;
                var appleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
                if (appleMeta) appleMeta.setAttribute('content', appName);
              })();
              
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered with scope:', registration.scope);
                  }, function(err) {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}