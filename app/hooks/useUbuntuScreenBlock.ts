"use client";

import { useEffect, useRef } from "react";

/**
 * Ubuntu Ekran Karartma Engelleyici
 * Timer çalışırken DPMS'i disable eder, durduğunda yeniden aktif eder.
 */
export function useUbuntuScreenBlock(enabled: boolean) {
  const wasBlockedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    // Ekranı aktif tut — DPMS'i kapat
    try {
      const off = "/usr/bin/xset";
      // DPMS'i kapat (screen blanktimeout, standby, suspend)
      require("child_process").execSync(
        `${off} s off && ${off} -dpms && ${off} s noblank`,
        { stdio: "ignore" }
      );
      wasBlockedRef.current = true;
    } catch {
      // xset çalışmazsa sessizce devam et
    }

    return () => {
      if (wasBlockedRef.current) {
        try {
          const on = "/usr/bin/xset";
          require("child_process").execSync(
            `${on} s on && ${on} +dpms`,
            { stdio: "ignore" }
          );
          wasBlockedRef.current = false;
        } catch {
          // sessiz
        }
      }
    };
  }, [enabled]);
}