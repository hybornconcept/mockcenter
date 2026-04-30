import { pgTable, uuid, integer, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { transactionStatusEnum } from "./enums";

// ─── Credit Packages ──────────────────────────────────────────────────────────
export const creditPackages = pgTable("credit_packages", {
  id:        uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name:      text("name").notNull(),
  credits:   integer("credits").notNull(),
  priceNgn:  integer("price_ngn").notNull(),
  // FIX: was text("is_active").default("true") — string comparison, not boolean
  isActive:  boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  // Most queries only want active packages
  activeIdx: index("cp_active_idx").on(t.isActive),
}));

// ─── Credit Transactions ─────────────────────────────────────────────────────
export const creditTransactions = pgTable("credit_transactions", {
  id:                 uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId:             text("user_id").notNull().references(() => users.id),
  packageId:          uuid("package_id").references(() => creditPackages.id),
  amount:             integer("amount").notNull(),
  amountNgn:          integer("amount_ngn").notNull(),
  status:             transactionStatusEnum("status").notNull().default("pending"),
  paystackReference:  text("paystack_reference").unique(),
  createdAt:          timestamp("created_at").defaultNow(),
  updatedAt:          timestamp("updated_at").defaultNow(),
}, (t) => ({
  // FIX: credit history loads all transactions for a user — was a seq scan
  userIdx:      index("ct_user_idx").on(t.userId),
  // FIX: revenue analytics filters by status = 'success'
  statusIdx:    index("ct_status_idx").on(t.status),
  // Combined for user revenue reports
  userStatusIdx: index("ct_user_status_idx").on(t.userId, t.status),
}));
