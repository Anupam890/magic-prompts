const CACHE_NAME = "magic-prompts-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["/", "/manifest.json"]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Skip non-GET, Next.js internal assets, and API requests
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("/_next/") ||
    event.request.url.includes("/api/") ||
    event.request.url.includes("localhost")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch((err) => {
          console.warn("SW fetch bypass for:", event.request.url);
          return new Response("", { status: 404, statusText: "Not Found" });
        })
      );
    })
  );
});
