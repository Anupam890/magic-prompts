import { fetchPromptsPage } from "@/lib/prompts-data";
import { BananaClient } from "./banana-client";

export const metadata = {
  title: "Nano Banana Prompts Categories — AI Image Generation Library",
  description: "Browse all Nano Banana prompts, Midjourney filters, ChatGPT DALL-E 3 triggers, and Stable Diffusion categories.",
};

export default async function CategoriesIndexPage() {
  let initialData: { items: any[]; nextPage: number | null; total: number } = { items: [], nextPage: null, total: 0 };
  try {
    initialData = await fetchPromptsPage({
      page: 0,
      category: "All",
      model: "All",
      sort: "trending",
    });
  } catch (e) {
    console.error("Failed to fetch initial categories data:", e);
  }

  return (
    <BananaClient
      initialCategory="All"
      initialCategorySlug="all"
      initialData={initialData}
    />
  );
}
