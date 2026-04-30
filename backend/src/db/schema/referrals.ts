import { pgTable, uuid, text, integer, timestamp, index, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { referralStatusEnum } from "./enums";

export const referrals = pgTable("referrals", {
  id:             uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId:     text("referrer_id").notNull().references(() => users.id),
  referredId:     text("referred_id").notNull().references(() => users.id),
  status:         referralStatusEnum("status").notNull().default("signed_up"),
  creditsAwarded: integer("credits_awarded").default(0),
  createdAt:      timestamp("created_at").defaultNow(),
  updatedAt:      timestamp("updated_at").defaultNow(),
}, (t) => ({
  uniqueReferral:  unique().on(t.referrerId, t.referredId),
  // FIX: dashboard loads all referrals made by a user
  referrerIdx:     index("ref_referrer_idx").on(t.referrerId),
  referredIdx:     index("ref_referred_idx").on(t.referredId),
}));
