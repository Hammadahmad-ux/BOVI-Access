import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config/site";
import { getServices, getPublishedProjects } from "@/lib/content/provider";

/**
 * Static routes are listed explicitly rather than crawled, so a route that
 * is not ready to be indexed cannot leak into the sitemap by accident.
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

/**
 * Service URLs come from the PROVIDER, not from the local service list.
 *
 * That is the difference between a sitemap that describes the site and
 * one that describes the code: a service Renan publishes in Studio has a
 * real, indexable URL, and it belongs here the moment it exists. Reading
 * the local list would have permanently hidden every new service from
 * Google.
 *
 * By the same token, unpublishing removes it. The provider only ever
 * returns published documents — the Sanity client is pinned to the
 * `published` perspective — so drafts never appear here.
 *
 * Regenerated on the same hourly cycle as the pages, and immediately on
 * publish via the webhook.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [services, projects] = await Promise.all([
    getServices(),
    getPublishedProjects(),
  ]);

  // Belt and braces: the provider merges two sources, so guard against a
  // slug appearing twice rather than emitting a duplicate URL.
  const serviceSlugs = [...new Set(services.map((service) => service.slug))];
  const projectSlugs = [
    ...new Set(
      projects
        .map((project) => project.slug)
        .filter((slug): slug is string => Boolean(slug)),
    ),
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: route.priority,
    })),
    ...serviceSlugs.map((slug) => ({
      url: `${siteUrl}/services/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...projectSlugs.map((slug) => ({
      url: `${siteUrl}/projects/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
