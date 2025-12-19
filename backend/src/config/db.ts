import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const { DB_HOST, USERDB, PASSWORD, DATABASE } = process.env;

if (!DB_HOST || !USERDB || !PASSWORD || !DATABASE) {
  throw new Error("Missing one or more required DB environment variables");
}

export const pool = mysql.createPool({
  host: DB_HOST,
  user: USERDB,
  password: PASSWORD,
  database: DATABASE,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
});
