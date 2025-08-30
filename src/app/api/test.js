// test.js (in src/app/api/)
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (go up 3 levels from src/app/api)
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Debug: Check if environment variables are loaded
console.log('SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Loaded' : 'Not loaded');

// Import AFTER loading environment variables
const { supabase } = await import('./supabase.js');

async function testSupabase() {
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    console.error("❌ Supabase connection failed:", error.message);
  } else {
    console.log("✅ Supabase connected! Users table data:", data);
  }
}

testSupabase();