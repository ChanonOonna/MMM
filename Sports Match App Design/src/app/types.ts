export type View =
  | "auth" | "onboarding"
  | "app" | "qr" | "profile-other" | "edit-profile"
  | "notifications" | "search" | "settings" | "admin"
  | "report" | "event-detail-full" | "session-detail-full"
  | "organizer";
export type MainTab = "swipe" | "sessions" | "chat" | "events" | "profile";
export type AdminTab = "dashboard" | "reports" | "events" | "rooms" | "sports" | "venues" | "achievements" | "roles" | "heatmap";
export type OrgTab = "my-events" | "qr-scan" | "members" | "announce";
