import { fetchPromptsPage, getCategories } from "@/lib/prompts-data";
import { BananaClient } from "../banana-client";

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

async function resolveCategoryName(slug: string): Promise<string> {
  if (!slug || slug === "all") return "All";
  try {
    const allCats = await getCategories();
    const match = allCats.find(
      (c) => c.slug === slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
    );
    if (match) return match.name;
  } catch (e) {
    console.warn("Failed to resolve category from slug:", e);
  }
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.category || "all";
  const categoryName = await resolveCategoryName(categorySlug);

  return {
    title: `${categoryName} Nano Banana Prompts — AI Image Generation Library`,
    description: `Explore top-rated ${categoryName} Nano Banana prompts, ChatGPT DALL-E 3 triggers, and Midjourney presets for photorealistic AI rendering.`,
    keywords: [
      `${categoryName} prompts`,
      "Nano Banana prompts",
      "ChatGPT AI image prompts",
      "Midjourney prompt generator",
      "Stable Diffusion AI prompts",
    ],
  };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.category || "all";
  const initialCategory = await resolveCategoryName(categorySlug);

  let initialData: { items: any[]; nextPage: number | null; total: number } = { items: [], nextPage: null, total: 0 };
  try {
    initialData = await fetchPromptsPage({
      page: 0,
      category: initialCategory,
      model: "All",
      sort: "trending",
    });
  } catch (e) {
    console.error("Failed to fetch initial category prompts:", e);
  }

  return (
    <BananaClient
      initialCategory={initialCategory}
      initialCategorySlug={categorySlug}
      initialData={initialData}
    />
  );
}
