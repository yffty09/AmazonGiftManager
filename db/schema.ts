import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password_digest: text("password_digest").notNull(),
});

export const giftCards = pgTable("gift_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  code: text("code").notNull(),
  amount: integer("amount").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  recipientName: text("recipient_name"),
  recipientEmail: text("recipient_email"),
  sentAt: timestamp("sent_at"),
  receivedAt: timestamp("received_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertGiftCardSchema = createInsertSchema(giftCards);
export const selectGiftCardSchema = createSelectSchema(giftCards);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type GiftCard = typeof giftCards.$inferSelect;
export type InsertGiftCard = typeof giftCards.$inferInsert;