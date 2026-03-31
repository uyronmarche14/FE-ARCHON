import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup"],
        disallow: ["/app/"],
      },
    ],
    sitemap: `${siteConfig.appUrl}/sitemap.xml`,
    host: siteConfig.appUrl,
  };
}
