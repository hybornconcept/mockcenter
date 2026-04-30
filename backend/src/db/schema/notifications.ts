import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { notificationTypeEnum } from "./enums";

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id:        uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:      notificationTypeEnum("type").notNull(),
  title:     text("title").notNull(),
  message:   text("message").notNull(),
  isRead:    boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  // FIX: every notification feed query filters by user_id — was a seq scan
  userIdx:     index("notif_user_idx").on(t.userId),
  // FIX: unread count badge on layout queries isRead = false per user
  userReadIdx: index("notif_user_read_idx").on(t.userId, t.isRead),
  createdIdx:  index("notif_created_idx").on(t.createdAt),
}));

// NOTE: notification_settings table has been removed.
// The 4 boolean columns (emailNotifications, pushNotifications, creditAlerts, referralAlerts)
// are now directly on the `users` table, eliminating a JOIN on every notification send.
// If you have existing notification_settings data, run the migration script first:
//   INSERT INTO users (email_notifications, push_notifications, credit_alerts, referral_alerts)
//   SELECT email_enabled, push_enabled, credit_alerts, referral_alerts FROM notification_settings
//   WHERE user_id = users.id ON CONFLICT DO NOTHING;
