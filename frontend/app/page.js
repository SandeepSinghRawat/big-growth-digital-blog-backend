import BlogCard from '../components/BlogCard.js';
import { fetchApi } from '../lib/api.js';

export default async function HomePage() {
  const response = await fetchApi('/posts?page=1&limit=8');
  const posts = response?.items || [];

  return (
    <main className="page-shell">
      <section className="hero-section">
        <div className="max-w-3xl space-y-6">
          <p className="eyebrow">Big Growth Digital</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Modern serverless blog CMS with MongoDB, Lambda, and Next.js App Router.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-200">
            Discover content, categories, tags, search, SEO metadata, and dynamic blog rendering.
          </p>
        </div>
      </section>

      <section className="grid-section">
        {posts.length > 0 ? (
          posts.map((post) => <BlogCard key={post._id} post={post} />)
        ) : (
          <p className="text-slate-600">No posts are available yet. Check back soon for new content.</p>
        )}
      </section>
    </main>
  );
}
