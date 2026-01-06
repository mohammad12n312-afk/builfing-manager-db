import "dotenv/config";
import { db } from "./db";
import { users } from "@shared/schema";
import bcrypt from "bcrypt";

async function seedSuperAdmin() {
  const username = process.env.SUPER_ADMIN_USERNAME;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin"; // اگر `SUPER_ADMIN_NAME` نبود، پیش‌فرض "Super Admin" رو می‌ده

  if (!username || !password || !name) {
    console.log("❌ SUPER ADMIN ENV VARIABLES NOT SET");
    process.exit(1);
  }

  const existing = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.role, "SUPER_ADMIN"),
  });

  if (existing) {
    console.log("ℹ️ SUPER ADMIN ALREADY EXISTS");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    username,
    password: hashedPassword,
    role: "SUPER_ADMIN",
    name: name, // مقدار name که از `.env` گرفته میشه
  });

  console.log("✅ SUPER ADMIN CREATED");
  process.exit(0);
}

seedSuperAdmin();

