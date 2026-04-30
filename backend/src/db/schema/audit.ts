import { pgTable, uuid, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

// ─── Audit Logs ───────────────────────────────────────────────────────────────
// Tracks all admin mutations for accountability.
// Kept append-only — never update or delete rows from this table.
export const auditLogs = pgTable("audit_logs", {
  id:         uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId:    text("admin_id").notNull().references(() => users.id, { onDelete: "set null" }),
  adminEmail: text("admin_email").notNull(),
  action:     text("action").notNull(),          // e.g. "user.suspend", "question.delete"
  targetType: text("target_type"),               // e.g. "user", "question", "notification"
  targetId:   text("target_id"),                 // UUID or string ID of the affected record
  metadata:   jsonb("metadata"),                 // free-form extra context (old/new values)
  ip:         text("ip"),
  createdAt:  timestamp("created_at").defaultNow(),
}, (t) => ({
  adminIdx:   index("al_admin_idx").on(t.adminId),
  actionIdx:  index("al_action_idx").on(t.action),
  createdIdx: index("al_created_idx").on(t.createdAt),
}));
