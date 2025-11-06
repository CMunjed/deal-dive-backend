import "dotenv/config";
import { supabase } from "./config/supabase-client.js";

async function getToken() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "", // Specify email
    password: "", // Specify password
  });

  if (error) {
    console.error("Error signing in:", error.message);
    process.exit(1);
  }

  console.log("\nAccess Token:\n");
  console.log(data.session?.access_token);
}

getToken();

// npx tsx src/get-auth-token.ts
