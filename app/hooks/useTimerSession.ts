"use client";

import { useEffect, useRef, useCallback } from "react";

const TAB_LOCK_KEY = "yaverfx-timer-tab-lock";
const TIMER_STATE_KEY = "yaverfx-timer-running";
const TAB_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export interface TimerSessionState {
  isActiveTab: boolean;
  isLocked: boolean;
  lockedByTab: string | null;
  endTime: number | null;
  mode: "work" | "shortBreak" | "longBreak" | null;
}

interface UseTimerSessionReturn {
  isActiveTab: boolean;
  isLocked: boolean;
  lockedByTab: string | null;
  acquireLock: (endTime: number, mode: "work" | "shortBreak" | "longBreak") => boolean;
  releaseLock: () => void;
  refreshLock: () => void;
}

/**
 * Manages timer session across multiple tabs.
 * Prevents race conditions by ensuring only one tab runs the timer.
 */
export function useTimerSession(): UseTimerSessionReturn {
  const isActiveTabRef = useRef(false);
  const isLockedRef = useRef(false);
  const lockedByTabRef = useRef<string | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Initialize BroadcastChannel for cross-tab communication
  useEffect(() => {
    try {
      broadcastChannelRef.current = new BroadcastChannel("yaverfx-timer-channel");
      
      broadcastChannelRef.current.onmessage = (event) => {
        const { type, tabId, endTime, mode } = event.data;
        
        if (type === "lock_acquired" && tabId !== TAB_ID) {
          // Another tab acquired the lock
          isLockedRef.current = true;
          lockedByTabRef.current = tabId;
          // Dispatch custom event for UI updates
          window.dispatchEvent(new CustomEvent("yaverfx-timer-lock-change", {
            detail: { isLocked: true, lockedBy: tabId }
          }));
        } else if (type === "lock_released" && tabId !== TAB_ID) {
          // Another tab released the lock
          isLockedRef.current = false;
          lockedByTabRef.current = null;
          window.dispatchEvent(new CustomEvent("yaverfx-timer-lock-change", {
            detail: { isLocked: false, lockedBy: null }
          }));
        } else if (type === "lock_refresh" && tabId !== TAB_ID) {
          // Another tab refreshed its lock - update our state
          isLockedRef.current = true;
          lockedByTabRef.current = tabId;
        } else if (type === "state_sync") {
          // Another tab is sending state - useful for initial sync
          window.dispatchEvent(new CustomEvent("yaverfx-timer-state-sync", {
            detail: { tabId, endTime, mode }
          }));
        }
      };
    } catch {
      // BroadcastChannel not supported - fall back to storage events
    }

    return () => {
      broadcastChannelRef.current?.close();
    };
  }, []);

  // Check if this tab was the one that locked
  const getStoredLock = useCallback((): { tabId: string; endTime: number; mode: string } | null => {
    try {
      const stored = sessionStorage.getItem(TAB_LOCK_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return null;
  }, []);

  // Initialize: check if another tab has the lock
  useEffect(() => {
    const storedLock = getStoredLock();
    
    if (storedLock && storedLock.tabId !== TAB_ID) {
      // Another tab has the lock
      if (storedLock.endTime > Date.now()) {
        isLockedRef.current = true;
        lockedByTabRef.current = storedLock.tabId;
        isActiveTabRef.current = false;
      } else {
        // Lock expired, clear it
        try {
          sessionStorage.removeItem(TAB_LOCK_KEY);
        } catch {}
      }
    } else if (storedLock && storedLock.tabId === TAB_ID) {
      // We had the lock in a previous session
      if (storedLock.endTime > Date.now()) {
        isLockedRef.current = true;
        lockedByTabRef.current = TAB_ID;
        isActiveTabRef.current = true;
      }
    }

    // Listen for storage changes (backup for BroadcastChannel)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === TAB_LOCK_KEY && event.newValue) {
        try {
          const newLock = JSON.parse(event.newValue);
          if (newLock.tabId !== TAB_ID) {
            isLockedRef.current = true;
            lockedByTabRef.current = newLock.tabId;
            window.dispatchEvent(new CustomEvent("yaverfx-timer-lock-change", {
              detail: { isLocked: true, lockedBy: newLock.tabId }
            }));
          }
        } catch {}
      } else if (event.key === TAB_LOCK_KEY && event.newValue === null) {
        isLockedRef.current = false;
        lockedByTabRef.current = null;
        window.dispatchEvent(new CustomEvent("yaverfx-timer-lock-change", {
          detail: { isLocked: false, lockedBy: null }
        }));
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Handle page unload - release lock or transfer to another tab
    const handleBeforeUnload = () => {
      const storedLock = getStoredLock();
      if (storedLock && storedLock.tabId === TAB_ID) {
        // We had the lock - try to transfer to another tab or clear
        try {
          // We'll rely on the other mechanism to detect lock loss
          // Just clear our session storage
          sessionStorage.removeItem(TAB_LOCK_KEY);
        } catch {}
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [getStoredLock]);

  // Acquire lock for this tab
  const acquireLock = useCallback((endTime: number, mode: "work" | "shortBreak" | "longBreak"): boolean => {
    const storedLock = getStoredLock();
    
    // If another tab has a valid lock, we can't acquire
    if (storedLock && storedLock.tabId !== TAB_ID && storedLock.endTime > Date.now()) {
      return false;
    }
    
    try {
      const lockData = {
        tabId: TAB_ID,
        endTime,
        mode,
        acquiredAt: Date.now()
      };
      sessionStorage.setItem(TAB_LOCK_KEY, JSON.stringify(lockData));
      
      isLockedRef.current = true;
      lockedByTabRef.current = TAB_ID;
      isActiveTabRef.current = true;
      
      // Notify other tabs
      broadcastChannelRef.current?.postMessage({
        type: "lock_acquired",
        tabId: TAB_ID,
        endTime,
        mode
      });
      
      return true;
    } catch {
      return false;
    }
  }, [getStoredLock]);

  // Release lock
  const releaseLock = useCallback(() => {
    const storedLock = getStoredLock();
    if (storedLock && storedLock.tabId === TAB_ID) {
      try {
        sessionStorage.removeItem(TAB_LOCK_KEY);
      } catch {}
    }
    
    isLockedRef.current = false;
    lockedByTabRef.current = null;
    isActiveTabRef.current = false;
    
    // Notify other tabs
    broadcastChannelRef.current?.postMessage({
      type: "lock_released",
      tabId: TAB_ID
    });
  }, [getStoredLock]);

  // Refresh lock (extend endTime)
  const refreshLock = useCallback(() => {
    const storedLock = getStoredLock();
    if (storedLock && storedLock.tabId === TAB_ID) {
      try {
        const updatedLock = { ...storedLock, refreshedAt: Date.now() };
        sessionStorage.setItem(TAB_LOCK_KEY, JSON.stringify(updatedLock));
        
        broadcastChannelRef.current?.postMessage({
          type: "lock_refresh",
          tabId: TAB_ID
        });
      } catch {}
    }
  }, [getStoredLock]);

  return {
    get isActiveTab() { return isActiveTabRef.current; },
    get isLocked() { return isLockedRef.current; },
    get lockedByTab() { return lockedByTabRef.current; },
    acquireLock,
    releaseLock,
    refreshLock
  };
}
