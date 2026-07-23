import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eeeiifyazkddkdxzbfiv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZWlpZnlhemtkZGtkeHpiZml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MzAwMzUsImV4cCI6MjEwMDMwNjAzNX0.O1iB50FQl2aTENFhmxKmqzDpm7YZQ-oYmRQhaUd01bk";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSubmission() {
  const id = `user-test-${Date.now()}`;
  const payload = {
    id,
    slug: `test-neon-cyberpunk-samurai-${Date.now().toString().slice(-4)}`,
    title: "Test Neon Cyberpunk Samurai",
    category: "Character Design",
    model: "Flux",
    description: "Futuristic neon samurai character portrait created by community member.",
    prompt: "Futuristic neon cyberpunk samurai in rainy Tokyo street, glowing cyan visor, high contrast rim light, octane render 8k",
    negative: "blurry, low quality",
    tags: ["cyberpunk", "samurai", "flux"],
    aspect: "4:5",
    image_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800",
    ratio: 1.25,
    status: "pending",
  };

  const { data, error } = await supabase.from("prompts").insert(payload);
  if (error) {
    console.error("Failed to insert pending prompt:", error.message);
  } else {
    console.log("SUCCESS! Created pending submission with ID:", id);
  }
}

testSubmission();
