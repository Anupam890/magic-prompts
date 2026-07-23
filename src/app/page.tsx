"use client";

import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Categories } from "@/components/categories";
import { Gallery } from "@/components/gallery";
import { ModelsStrip } from "@/components/models";
import { Footer } from "@/components/footer";
import { AdsterraAd } from "@/components/adsterra-ad";

export default function Home() {
  const [category, setCategory] = useState("All");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip">
      <Nav />
      <main>
        <Hero />
        <Categories active={category} onChange={setCategory} />
        <AdsterraAd type="banner728x90" className="max-w-7xl mx-auto px-4" />
        <Gallery activeCategory={category} />
        <AdsterraAd type="banner728x90" className="max-w-7xl mx-auto px-4" />
        <ModelsStrip />
      </main>
      <Footer />
    </div>
  );
}
