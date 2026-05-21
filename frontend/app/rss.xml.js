import { fetchApi } from '../lib/api.js';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await fetchApi('/posts?status=published&limit=50');
  const posts = data?.items || [];
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  const rssItems = posts
    .map((post) => `
      <item>
        <title>${post.title}</title>
        <link>${baseUrl}/blog/${post.slug}</link>
        <guid>${baseUrl}/blog/${post.slug}</guid>
        <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
        <description>${post.seo?.metaDescription || post.summary || ''}</description>
      </item>
    `)
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Big Growth Digital Blog</title>
    <link>${baseUrl}</link>
    <description>Latest articles from the blog CMS.</description>
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
