import { Client } from 'pg';
import dotenv from 'dotenv';

// بارگذاری متغیرهای محیطی از فایل .env
dotenv.config();

// اتصال به دیتابیس
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function connectToDb() {
  try {
    // اتصال به دیتابیس
    await client.connect();
    console.log("🚀 Connected to the database successfully!");

    // اجرای یک کوئری ساده برای تست اتصال
    const res = await client.query('SELECT NOW()');
    console.log("Current Time:", res.rows[0]);

    // اضافه کردن ENUM جدید (در صورت نیاز)
    await client.query(`
      ALTER TYPE user_role ADD VALUE 'SUPER_ADMIN';
    `);
    console.log("✅ Added 'SUPER_ADMIN' to enum user_role");

  } catch (err) {
    console.error("❌ Error connecting to the database:", err);
  } finally {
    await client.end(); // بستن اتصال بعد از انجام کار
  }
}

// اجرا کردن تابع اتصال
connectToDb();
