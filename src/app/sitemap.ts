import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import {
  getAreaSlugs,
  getLawyerSlugs,
  getAllPosts,
} from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.baseUrl;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/quem-somos`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/areas`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/equipe`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contato`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  const areaRoutes: MetadataRoute.Sitemap = getAreaSlugs().map((slug) => ({
    url: `${base}/areas/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const lawyerRoutes: MetadataRoute.Sitemap = getLawyerSlugs().map((slug) => ({
    url: `${base}/equipe/${slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const postRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...areaRoutes, ...lawyerRoutes, ...postRoutes];
}
