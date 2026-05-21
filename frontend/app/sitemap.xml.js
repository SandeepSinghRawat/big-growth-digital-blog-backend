import { fetchApi } from '../lib/api.js';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await fetchApi('/posts?status=published&limit=100');
  const posts = data?.items || [];
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  const urls = posts.map((post) => `
    <url>
      <loc>${baseUrl}/blog/${post.slug}</loc>
      <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${urls.join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
