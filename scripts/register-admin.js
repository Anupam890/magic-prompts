import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eeeiifyazkddkdxzbfiv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZWlpZnlhemtkZGtkeHpiZml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MzAwMzUsImV4cCI6MjEwMDMwNjAzNX0.O1iB50FQl2aTENFhmxKmqzDpm7YZQ-oYmRQhaUd01bk";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function registerAdmin() {
  const email = "anupam.dev81@gmail.com";
  const password = "Sonu9014@";

  console.log(`Attempting to sign up admin user: ${email}...`);

  // First try sign up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: "Anupam Admin",
        role: "admin"
      }
    }
  });

  if (error) {
    console.log("SignUp Response Error:", error.message);
  } else {
    console.log("SignUp Successful! User ID:", data.user?.id);
  }

  // Next try signing in to test credentials
  console.log("Testing sign in with credentials...");
  const signInRes = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInRes.error) {
    console.log("SignIn Test Error:", signInRes.error.message);
  } else {
    console.log("SignIn Test SUCCESSFUL! User ID:", signInRes.data.user.id);
  }
}

registerAdmin();
