import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  const cols = [
    { title: "Product", links: ["Gallery", "Categories", "AI Models", "Popular Prompts"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
    { title: "Legal", links: ["Privacy Policy", "Terms", "Cookies", "License"] },
  ];

  return (
    <footer className="relative border-t border-white/[0.06] mt-12 md:mt-24">
      <div className="mx-auto max-w-7xl px-5 md:px-6 py-12 md:py-20">
        <div className="grid gap-10 md:gap-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_repeat(3,1fr)]">
          {/* Brand column */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-aurora blur-md opacity-70" />
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-aurora">
                  <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <span className="font-display text-lg font-semibold">Magic Prompts</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              The ultimate library of premium AI image prompts. Discover. Copy. Create.
            </p>

            <div className="mt-6 max-w-sm">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Get the weekly drop
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="you@studio.com"
                  className="flex-1 min-w-0 rounded-xl glass px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition shrink-0">
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3 md:mb-4">
                {c.title}
              </div>
              <ul className="space-y-2 md:space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-foreground/80 hover:text-foreground transition"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 md:mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] pt-6 md:pt-8">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} Magic Prompts. Discover. Copy. Create.
          </p>
          <div className="flex items-center gap-2">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="rounded-xl glass p-2 hover:bg-white/[0.08] transition"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
