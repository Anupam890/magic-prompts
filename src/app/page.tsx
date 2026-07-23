"use client";

import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Categories } from "@/components/categories";
import { Gallery } from "@/components/gallery";
import { ModelsStrip } from "@/components/models";
import { Footer } from "@/components/footer";

export default function Home() {
  const [category, setCategory] = useState("All");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip">
      <Nav />
      <main>
        <Hero />
        <Categories active={category} onChange={setCategory} />
        <Gallery activeCategory={category} />
        <ModelsStrip />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
