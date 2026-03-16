import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cambo-ea-web.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: string[] = [
    "",
    "/news",
    "/markets",
    "/calendar",
    "/analysis",
    "/ea-trading-bot",
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "hourly" : "daily",
    priority: route === "" ? 1 : 0.8,
  }));
}

