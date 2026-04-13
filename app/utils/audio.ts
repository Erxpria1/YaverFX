// Re-export from notifications.ts for backwards compatibility
export {
  NOTIFICATION_SOUNDS,
  setStoredSoundId,
  playNotificationSound,
  type NotificationSoundId,
  type SoundOption,
} from "./notifications";

// Legacy exports
export { playNotificationSound as playNotificationSoundOriginal } from "./notifications";
