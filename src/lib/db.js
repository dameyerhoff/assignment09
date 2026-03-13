import { Pool } from "pg";

// This pool manages multiple connections for your app automatically
// It reuses connections to improve performance and prevent "too many clients" errors
export const pool = new Pool({
  // Loads the sensitive database credentials from your .env file
  connectionString: process.env.DATABASE_URL,

  // If using Supabase, it's often helpful to add this for SSL:
  // Allows connections even if the certificate isn't strictly verified by the client
  ssl: {
    rejectUnauthorized: false,
  },
});
