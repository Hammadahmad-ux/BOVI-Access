import type { MetadataRoute } from "next";
import { services, siteUrl } from "@/lib/config/site";

/**
 * Static routes are listed explicitly rather than crawled, so a route that
 * is not ready to be indexed cannot leak into the sitemap by accident.
 * Project URLs join this list in Phase 4, sourced from Sanity.
 */
const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/services", priority: 0.9 },
  { path: "/about", priority: 0.7 },
  { path: "/portfolio", priority: 0.7 },
  { path: "/service-areas", priority: 0.6 },
  { path: "/contact", priority: 0.8 },
  { path: "/privacy", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: route.priority,
    })),
    ...services.map((service) => ({
      url: `${siteUrl}/services/${service.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
