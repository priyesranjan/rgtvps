import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/auth/login", "/auth/register"],
      },
    ],
    sitemap: "https://royalgoldtraders.in/sitemap.xml",
  };
}
