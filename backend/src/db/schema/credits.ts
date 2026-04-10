import { pgTable, uuid, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending", "success", "failed", "refunded"
]);

export const creditPackages = pgTable("credit_packages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  priceNgn: integer("price_ngn").notNull(),
  isActive: text("is_active").default("true"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  packageId: uuid("package_id").references(() => creditPackages.id),
  amount: integer("amount").notNull(),
  amountNgn: integer("amount_ngn").notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  paystackReference: text("paystack_reference").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
