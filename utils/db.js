import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema"

const connectionString = process.env.NEXT_PUBLIC_DRIZZLE_DB_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';
const sql = neon(connectionString);
export const db = drizzle(sql,{schema});