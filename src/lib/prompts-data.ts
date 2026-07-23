import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import p8 from "@/assets/p8.jpg";
import p9 from "@/assets/p9.jpg";
import p10 from "@/assets/p10.jpg";
import p11 from "@/assets/p11.jpg";
import p12 from "@/assets/p12.jpg";
import { supabase } from "@/lib/supabase/client";

export type Prompt = {
  id: string;
  slug: string;
  title: string;
  category: string;
  model: string;
  description: string;
  prompt: string;
  negative?: string;
  tags: string[];
  aspect: string;
  image: any;
  ratio: number; // height/width for masonry
  views: number;
  likes: number;
  copies: number;
};

export const CATEGORIES = [
  { name: "All", icon: "Sparkles" },
  { name: "E-commerce", icon: "ShoppingBag" },
  { name: "Photo Editing", icon: "Aperture" },
  { name: "Portrait & Avatar", icon: "User" },
  { name: "Character Design", icon: "Swords" },
  { name: "Anime & Cartoon", icon: "Star" },
  { name: "Art Style", icon: "Palette" },
  { name: "Interior Design", icon: "Sofa" },
  { name: "Visual Effects", icon: "Wand2" },
] as const;

export const MODELS = [
  "ChatGPT Images",
  "Gemini",
  "Midjourney",
  "Flux",
  "Leonardo AI",
  "Stable Diffusion",
  "Adobe Firefly",
  "Ideogram",
  "Recraft",
] as const;

export const PROMPTS: Prompt[] = [
  {
    id: "1",
    slug: "cinematic-luxury-watch-photography",
    title: "Cinematic Luxury Watch Photography",
    category: "E-commerce",
    model: "Midjourney",
    description: "Editorial-grade product shot with dramatic light and gold reflections.",
    prompt:
      "Cinematic luxury watch photography, close-up of a gold Rolex on dark marble surface, dramatic side lighting, soft shadows, extremely detailed macro shot, 8k, editorial fashion campaign, shallow depth of field",
    negative: "blurry, cartoon, low quality, watermark, text",
    tags: ["luxury", "product", "watch", "editorial"],
    aspect: "4:5",
    image: p1,
    ratio: 1.25,
    views: 24800,
    likes: 1820,
    copies: 942,
  },
  {
    id: "2",
    slug: "iridescent-holographic-portrait",
    title: "Iridescent Holographic Portrait",
    category: "Portrait & Avatar",
    model: "Flux",
    description: "High fashion editorial portrait with holographic makeup and studio light.",
    prompt:
      "Ethereal portrait of a woman with holographic iridescent makeup, dewy skin, studio lighting with soft magenta and cyan rim lights, high fashion editorial photography, hasselblad, 85mm, ultra detailed",
    tags: ["portrait", "fashion", "holographic", "editorial"],
    aspect: "4:5",
    image: p2,
    ratio: 1.35,
    views: 31200,
    likes: 2410,
    copies: 1150,
  },
  {
    id: "3",
    slug: "neon-tokyo-anime-girl",
    title: "Neon Tokyo Anime Girl",
    category: "Anime & Cartoon",
    model: "Leonardo AI",
    description: "Kawaii anime portrait against a rainy neon Tokyo street.",
    prompt:
      "Anime girl with pink pastel hair and headphones, cyberpunk neon Tokyo street background, colorful signage, cinematic composition, high detail, studio ghibli lighting mixed with cyberpunk",
    tags: ["anime", "cyberpunk", "portrait"],
    aspect: "4:5",
    image: p3,
    ratio: 1.28,
    views: 18400,
    likes: 1450,
    copies: 720,
  },
  {
    id: "4",
    slug: "wabi-sabi-golden-hour-interior",
    title: "Wabi-Sabi Golden Hour Interior",
    category: "Interior Design",
    model: "Midjourney",
    description: "Minimal luxury interior with warm sunset light and organic forms.",
    prompt:
      "Minimalist luxury interior, curved cream sofa, warm sunset light through floor-to-ceiling windows, wabi-sabi aesthetic, natural materials, architectural photography, magazine quality",
    tags: ["interior", "architecture", "minimal"],
    aspect: "16:9",
    image: p4,
    ratio: 0.9,
    views: 12900,
    likes: 980,
    copies: 512,
  },
  {
    id: "5",
    slug: "floating-perfume-splash",
    title: "Floating Perfume Splash",
    category: "E-commerce",
    model: "Ideogram",
    description: "Levitating perfume bottle with a poetic liquid splash on pastel.",
    prompt:
      "Levitating clear perfume bottle with dynamic peach liquid splash, soft pastel pink background, commercial product photography, high-key lighting, luxury cosmetics campaign",
    tags: ["product", "cosmetics", "splash"],
    aspect: "4:5",
    image: p5,
    ratio: 1.24,
    views: 22100,
    likes: 1620,
    copies: 840,
  },
  {
    id: "6",
    slug: "epic-fantasy-warrior-concept",
    title: "Epic Fantasy Warrior Concept",
    category: "Character Design",
    model: "Stable Diffusion",
    description: "Dramatic character concept art with ornate armor and backlight.",
    prompt:
      "Fantasy warrior character concept art, ornate obsidian armor with gold trim, dramatic rim light, atmospheric fog, digital painting, artstation trending, wlop style",
    tags: ["character", "fantasy", "concept"],
    aspect: "4:5",
    image: p6,
    ratio: 1.37,
    views: 15600,
    likes: 1240,
    copies: 610,
  },
  {
    id: "7",
    slug: "isometric-dreamy-island",
    title: "Isometric Dreamy Island",
    category: "Art Style",
    model: "Midjourney",
    description: "Cinema 4D-style floating island in soft pastel palette.",
    prompt:
      "3D isometric floating island with waterfalls and tiny ruins, soft pastel pink background, cinema 4d octane render, clay materials, dreamy soft lighting",
    tags: ["3d", "isometric", "render"],
    aspect: "1:1",
    image: p7,
    ratio: 1.12,
    views: 9800,
    likes: 720,
    copies: 380,
  },
  {
    id: "8",
    slug: "liquid-chrome-sculpture",
    title: "Liquid Chrome Sculpture",
    category: "Visual Effects",
    model: "Flux",
    description: "Iridescent liquid chrome form on clean studio white.",
    prompt:
      "Abstract liquid chrome sculpture with iridescent purple and blue reflections, studio white background, hyper-detailed, product render, octane, y2k aesthetic",
    tags: ["3d", "abstract", "chrome"],
    aspect: "4:5",
    image: p8,
    ratio: 1.25,
    views: 14200,
    likes: 1080,
    copies: 490,
  },
  {
    id: "9",
    slug: "ghibli-golden-hills",
    title: "Ghibli Golden Hills",
    category: "Art Style",
    model: "Gemini",
    description: "Studio Ghibli–inspired painted landscape at magic hour.",
    prompt:
      "Studio Ghibli inspired pastoral countryside, rolling golden hills, wildflowers, silhouette of animals grazing, painterly clouds, warm evening light, hand-painted look",
    tags: ["ghibli", "landscape", "painting"],
    aspect: "4:5",
    image: p9,
    ratio: 1.4,
    views: 27400,
    likes: 2110,
    copies: 1030,
  },
  {
    id: "10",
    slug: "cosmic-nebula-astronaut",
    title: "Cosmic Nebula Astronaut",
    category: "Photo Editing",
    model: "Adobe Firefly",
    description: "Astronaut adrift in pink-purple cosmic clouds.",
    prompt:
      "Astronaut floating in a nebula of glowing pink and purple cosmic clouds, cinematic sci-fi, dreamy, starfield, high detail, movie poster composition",
    tags: ["space", "sci-fi", "editorial"],
    aspect: "4:5",
    image: p10,
    ratio: 1.26,
    views: 19700,
    likes: 1580,
    copies: 760,
  },
  {
    id: "11",
    slug: "levitating-minimal-sneaker",
    title: "Levitating Minimal Sneaker",
    category: "E-commerce",
    model: "Recraft",
    description: "Editorial white-on-white levitating sneaker.",
    prompt:
      "Minimalist white sneaker levitating, soft gradient light gray background, editorial product photography, subtle shadow, high-key lighting",
    tags: ["product", "footwear", "editorial"],
    aspect: "4:5",
    image: p11,
    ratio: 1.1,
    views: 8600,
    likes: 640,
    copies: 310,
  },
  {
    id: "12",
    slug: "cyberpunk-samurai-portrait",
    title: "Cyberpunk Samurai Portrait",
    category: "Character Design",
    model: "Midjourney",
    description: "Neon-lit samurai in the rain — moody and cinematic.",
    prompt:
      "Cyberpunk samurai portrait, ornate futuristic helmet, glowing blue mask, neon red rim light, rainy night city background, hyper-detailed, cinematic key art",
    tags: ["character", "cyberpunk", "portrait"],
    aspect: "4:5",
    image: p12,
    ratio: 1.38,
    views: 33200,
    likes: 2680,
    copies: 1290,
  },
];

export function getPrompt(slug: string) {
  return PROMPTS.find((p) => p.slug === slug);
}

export async function getCategories(): Promise<{ name: string; icon: string; slug: string; description?: string }[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      return data;
    }
  } catch (e) {
    console.warn("Using local fallback categories...", e);
  }

  return [
    { name: "All", icon: "Sparkles", slug: "all", description: "All prompts from our community" },
    { name: "E-commerce", icon: "ShoppingBag", slug: "ecommerce", description: "Professional product photography and commercial visual assets" },
    { name: "Photo Editing", icon: "Aperture", slug: "photo-editing", description: "Prompts for touch-ups, background removal, and enhancements" },
    { name: "Portrait & Avatar", icon: "User", slug: "portrait-avatar", description: "Photorealistic portraits and stylized avatars" },
    { name: "Character Design", icon: "Swords", slug: "character-design", description: "Concept art, game characters, and warriors" },
    { name: "Anime & Cartoon", icon: "Star", slug: "anime-cartoon", description: "Ghibli style, classic anime, and modern cartoons" },
    { name: "Art Style", icon: "Palette", slug: "art-style", description: "Oil paintings, water colors, and surrealism art styles" },
    { name: "Interior Design", icon: "Sofa", slug: "interior-design", description: "Modern, minimalist, and rustic interior spaces" },
    { name: "Visual Effects", icon: "Wand2", slug: "visual-effects", description: "Liquid chrome, abstract renders, and particle effects" },
  ];
}

export async function getModels(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("models")
      .select("name")
      .order("id", { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((m: any) => m.name);
    }
  } catch (e) {
    console.warn("Using local fallback models...", e);
  }
  return [...MODELS];
}


// -------- Paginated fetching (client-side, mocked) --------
export type SortKey = "trending" | "newest" | "copied" | "liked";

export type PromptsPage = {
  items: Prompt[];
  nextPage: number | null;
  total: number;
};

// Expand the base pool into a larger synthetic library for infinite scroll demo
const EXPANDED: Prompt[] = Array.from({ length: 8 }).flatMap((_, batch) =>
  PROMPTS.map((p, i) => ({
    ...p,
    id: `${p.id}-${batch}`,
    slug: batch === 0 ? p.slug : `${p.slug}-${batch}`,
    views: Math.round(p.views * (0.4 + Math.random() * 1.2)),
    likes: Math.round(p.likes * (0.4 + Math.random() * 1.2)),
    copies: Math.round(p.copies * (0.4 + Math.random() * 1.2)),
    ratio: p.ratio * (0.92 + ((i + batch) % 5) * 0.04),
  })),
);

export function getAllPrompts() {
  return EXPANDED;
}

export async function getAllPromptsFromSupabase(): Promise<Prompt[]> {
  try {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        model: p.model,
        description: p.description,
        prompt: p.prompt,
        negative: p.negative || "",
        tags: p.tags || [],
        aspect: p.aspect,
        image: p.image_url,
        ratio: p.ratio,
        views: p.views || 0,
        likes: p.likes || 0,
        copies: p.copies || 0,
      }));
    }
  } catch (e) {
    console.warn("Using local fallback prompts...", e);
  }
  return EXPANDED;
}

export async function fetchPromptsPage(params: {
  page: number;
  pageSize?: number;
  category: string;
  model: string;
  sort: SortKey;
}): Promise<PromptsPage> {
  const { page, pageSize = 12, category, model, sort } = params;

  try {
    let query = supabase
      .from("prompts")
      .select("*", { count: "exact" });

    if (category !== "All") {
      query = query.eq("category", category);
    }
    if (model !== "All") {
      query = query.eq("model", model);
    }

    if (sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sort === "copied") {
      query = query.order("copies", { ascending: false });
    } else if (sort === "liked") {
      query = query.order("likes", { ascending: false });
    } else { // trending
      query = query.order("views", { ascending: false });
    }

    const start = page * pageSize;
    const end = start + pageSize - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;
    if (error) throw error;

    if (data && data.length > 0) {
      const items = data.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        model: p.model,
        description: p.description,
        prompt: p.prompt,
        negative: p.negative || "",
        tags: p.tags || [],
        aspect: p.aspect,
        image: p.image_url,
        ratio: p.ratio,
        views: p.views || 0,
        likes: p.likes || 0,
        copies: p.copies || 0,
      }));

      const nextPage = start + pageSize < (count || 0) ? page + 1 : null;
      return { items, nextPage, total: count || 0 };
    }
  } catch (e) {
    console.warn("Database query failed or tables missing. Falling back to local static presets...", e);
  }

  // Fallback to local static presets
  let list = [...EXPANDED];
  if (category !== "All") list = list.filter((p) => p.category === category);
  if (model !== "All") list = list.filter((p) => p.model === model);

  switch (sort) {
    case "newest":
      list.reverse();
      break;
    case "copied":
      list.sort((a, b) => b.copies - a.copies);
      break;
    case "liked":
      list.sort((a, b) => b.likes - a.likes);
      break;
    case "trending":
      list.sort((a, b) => b.views - a.views);
      break;
  }

  const start = page * pageSize;
  const items = list.slice(start, start + pageSize);
  const nextPage = start + pageSize < list.length ? page + 1 : null;

  await new Promise((r) => setTimeout(r, 550));

  return { items, nextPage, total: list.length };
}

export async function incrementPromptViews(promptId: string) {
  try {
    const { data } = await supabase
      .from("prompts")
      .select("views")
      .eq("id", promptId)
      .single();
    if (data) {
      await supabase
        .from("prompts")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", promptId);
    }
  } catch (e) {
    console.error("Failed to increment views in Supabase:", e);
  }
}

export async function incrementPromptLikes(promptId: string) {
  try {
    const { data } = await supabase
      .from("prompts")
      .select("likes")
      .eq("id", promptId)
      .single();
    if (data) {
      await supabase
        .from("prompts")
        .update({ likes: (data.likes || 0) + 1 })
        .eq("id", promptId);
    }
  } catch (e) {
    console.error("Failed to increment likes in Supabase:", e);
  }
}

export async function incrementPromptCopies(promptId: string) {
  try {
    const { data } = await supabase
      .from("prompts")
      .select("copies")
      .eq("id", promptId)
      .single();
    if (data) {
      await supabase
        .from("prompts")
        .update({ copies: (data.copies || 0) + 1 })
        .eq("id", promptId);
    }
  } catch (e) {
    console.error("Failed to increment copies in Supabase:", e);
  }
}
