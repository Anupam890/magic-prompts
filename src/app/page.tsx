"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
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
        <Hero onSelectCategory={setCategory} />
        <AdsterraAd placement="below-hero" className="max-w-7xl mx-auto px-4" />
        <Gallery activeCategory={category} />
        <AdsterraAd placement="footer" className="max-w-7xl mx-auto px-4" />
        <ModelsStrip />
      </main>
      <Footer />
    </div>
  );
}
