"use client";

import { useState, useEffect, useRef } from "react";

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPromptRef = useRef<any>(null);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                          (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed the prompt
    const dismissed = localStorage.getItem("yaverfx-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      // Show again after 3 days
      if (Date.now() - dismissedTime < 3 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Only show on iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      // Delay showing the prompt
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }

    // Check for Android PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleAddToHome = () => {
    // iOS: Open share sheet
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      // Try using Web Share API first (iOS Safari)
      if (navigator.share) {
        navigator.share({
          title: "YaverFX'i Yükle",
          text: "YaverFX'i ana ekranına ekle",
          url: window.location.href,
        }).catch(() => {});
      } else {
        // Fallback: show manual instructions
        alert("Safari'de paylaşım düğmesine (kutucukla ok) tıklayın, ardından 'Ana Ekrana Ekle' seçeneğini seçin.");
      }
    } else if (deferredPromptRef.current) {
      // Android: Show install prompt
      deferredPromptRef.current.prompt();
      deferredPromptRef.current.userChoice.then((choice: any) => {
        if (choice.outcome === "accepted") {
          setShowPrompt(false);
        }
        deferredPromptRef.current = null;
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("yaverfx-install-dismissed", Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="pwa-prompt">
      <div className="pwa-prompt-content">
        <div className="pwa-prompt-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="pwa-prompt-text">
          <strong>YaverFX'i Ana Ekrana Ekle</strong>
          <p>Hızlı erişim için uygulamayı ana ekranınıza ekleyin</p>
        </div>
        <div className="pwa-prompt-actions">
          <button onClick={handleAddToHome} className="pwa-btn-install">
            Ekle
          </button>
          <button onClick={handleDismiss} className="pwa-btn-dismiss">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}