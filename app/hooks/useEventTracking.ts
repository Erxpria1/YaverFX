"use client";

import { useCallback, useRef } from "react";

// Event schema based on Sprint 1 requirements
export type TimerEvent = 
  | "timer_started"
  | "timer_completed"
  | "timer_paused"
  | "timer_reset";

export type TaskEvent =
  | "task_created"
  | "task_completed"
  | "task_deleted"
  | "task_edited";

export type NotificationEvent =
  | "notification_permission_granted"
  | "notification_permission_denied"
  | "notification_shown"
  | "notification_clicked"
  | "push_opened";

export type OnboardingEvent =
  | "onboarding_started"
  | "onboarding_completed"
  | "onboarding_skipped";

export type EventType = TimerEvent | TaskEvent | NotificationEvent | OnboardingEvent;

export interface AnalyticsEvent {
  event: EventType;
  timestamp: number;
  properties?: Record<string, string | number | boolean>;
}

// In-memory event buffer for batching
const EVENT_BUFFER_KEY = "yaverfx-analytics-buffer";
const FLUSH_INTERVAL = 5000; // 5 seconds
const MAX_BUFFER_SIZE = 20;

interface UseEventTrackingReturn {
  track: (event: EventType, properties?: Record<string, string | number | boolean>) => void;
  trackTimer: (event: TimerEvent, properties?: Record<string, string | number | boolean>) => void;
  trackTask: (event: TaskEvent, properties?: Record<string, string | number | boolean>) => void;
  trackNotification: (event: NotificationEvent, properties?: Record<string, string | number | boolean>) => void;
  trackOnboarding: (event: OnboardingEvent, properties?: Record<string, string | number | boolean>) => void;
  getEvents: () => AnalyticsEvent[];
  flush: () => void;
}

// Get existing events from storage
function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(EVENT_BUFFER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return [];
}

// Save events to storage
function storeEvents(events: AnalyticsEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EVENT_BUFFER_KEY, JSON.stringify(events.slice(-100))); // Keep last 100
  } catch {}
}

export function useEventTracking(): UseEventTrackingReturn {
  const bufferRef = useRef<AnalyticsEvent[]>(getStoredEvents());
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track any event
  const track = useCallback((
    event: EventType,
    properties?: Record<string, string | number | boolean>
  ) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: Date.now(),
      properties
    };

    bufferRef.current.push(analyticsEvent);
    
    // Keep buffer size limited
    if (bufferRef.current.length > MAX_BUFFER_SIZE) {
      bufferRef.current = bufferRef.current.slice(-MAX_BUFFER_SIZE);
    }

    // Persist to localStorage
    storeEvents(bufferRef.current);

    // Console logging for development
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.log("[Analytics]", event, properties);
    }

    // Auto-flush using requestIdleCallback for battery efficiency
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        if (bufferRef.current.length >= MAX_BUFFER_SIZE) {
          // auto-flush logic here if needed
        }
      }, { timeout: 2000 });
    }
  }, []);

  // Convenience methods
  const trackTimer = useCallback((
    event: TimerEvent,
    properties?: Record<string, string | number | boolean>
  ) => {
    track(event, properties);
  }, [track]);

  const trackTask = useCallback((
    event: TaskEvent,
    properties?: Record<string, string | number | boolean>
  ) => {
    track(event, properties);
  }, [track]);

  const trackNotification = useCallback((
    event: NotificationEvent,
    properties?: Record<string, string | number | boolean>
  ) => {
    track(event, properties);
  }, [track]);

  const trackOnboarding = useCallback((
    event: OnboardingEvent,
    properties?: Record<string, string | number | boolean>
  ) => {
    track(event, properties);
  }, [track]);

  const getEvents = useCallback((): AnalyticsEvent[] => {
    return [...bufferRef.current];
  }, []);

  const flush = useCallback(() => {
    if (bufferRef.current.length === 0) return;
    
    const events = [...bufferRef.current];
    
    const performFlush = () => {
      bufferRef.current = [];
      storeEvents([]);
      
      // In production: send to analytics endpoint
      // fetch("/api/analytics", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ events })
      // });
      
      console.log("[Analytics Flush]", events.length, "events");
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(performFlush, { timeout: 1000 });
    } else {
      performFlush();
    }
  }, []);

  return {
    track,
    trackTimer,
    trackTask,
    trackNotification,
    trackOnboarding,
    getEvents,
    flush
  };
}
