#!/usr/bin/env node
/**
 * Generate sitemap.xml for the project
 * Runs at build time to create public/sitemap.xml
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://esolution-engenharia.netlify.app";

const routes = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/privacidade", changefreq: "monthly", priority: 0.8 },
];

function generateSitemap() {
  const today = new Date().toISOString().split("T")[0];

  const urlEntries = routes
    .map(
      ({ path, changefreq, priority }) => `    <url>
        <loc>${BASE_URL}${path}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>
    </url>`,
    )
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

  const outputPath = resolve("public/sitemap.xml");
  writeFileSync(outputPath, sitemap);
  console.log(`✅ sitemap.xml generated at ${outputPath}`);
}

generateSitemap();
