import { db } from "./db";

async function checkEnum() {
  const result = await db.query.$executeRaw`
    SELECT unnest(enum_range(NULL::user_role)) AS role_value;
  `;
  console.log(result);
  process.exit(0);
}

checkEnum();
