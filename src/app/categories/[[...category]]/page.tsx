import { fetchPromptsPage } from "@/lib/prompts-data";
import { BananaClient } from "./banana-client";

interface PageProps {
  params: Promise<{
    category?: string[];
  }>;
}

const SLUG_TO_CATEGORY: Record<string, string> = {
  all: "All",
  ecommerce: "E-commerce",
  "photo-editing": "Photo Editing",
  "portrait-avatar": "Portrait & Avatar",
  "character-design": "Character Design",
  "anime-cartoon": "Anime & Cartoon",
  "art-style": "Art Style",
  "interior-design": "Interior Design",
  "visual-effects": "Visual Effects",
};

export default async function BananaPromptsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.category?.[0] || "all";
  const initialCategory = SLUG_TO_CATEGORY[categorySlug] || "All";

  // Prefetch first page on server
  const initialData = await fetchPromptsPage({
    page: 0,
    category: initialCategory,
    model: "All",
    sort: "trending",
  });

  return (
    <BananaClient
      initialCategory={initialCategory}
      initialCategorySlug={categorySlug}
      initialData={initialData}
    />
  );
}
