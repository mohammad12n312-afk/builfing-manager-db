import { pgTable, text, serial, integer, boolean, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["super_admin", "building_admin", "resident"]);
export const unitStatusEnum = pgEnum("unit_status", ["active", "inactive"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid"]);
export const senderTypeEnum = pgEnum("sender_type", ["admin", "resident"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull(),
  unitId: integer("unit_id"), // Nullable for admins
  createdAt: timestamp("created_at").defaultNow(),
});

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  unitNumber: text("unit_number").notNull(),
  floor: integer("floor").notNull(),
  status: unitStatusEnum("status").default("active").notNull(),
  residentId: integer("resident_id"), // Can be linked to a user
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id").notNull(),
  amount: integer("amount").notNull(),
  period: text("period").notNull(), // e.g., "1402-01"
  status: paymentStatusEnum("status").default("pending").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id").notNull(),
  senderType: senderTypeEnum("sender_type").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isRead: boolean("is_read").default(false),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertUnitSchema = createInsertSchema(units).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isRead: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Auth Types
export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export type LoginRequest = z.infer<typeof loginSchema>;

export const createAdminSchema = insertUserSchema.extend({
  role: z.literal("building_admin"),
});

export const createResidentSchema = insertUserSchema.extend({
  role: z.literal("resident"),
  unitId: z.number(),
});
