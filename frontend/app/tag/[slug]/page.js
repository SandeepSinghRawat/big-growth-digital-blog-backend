import BlogCard from '../../../components/BlogCard.js';
import { fetchApi } from '../../../lib/api.js';

export default async function TagPage({ params }) {
  const response = await fetchApi(`/posts?tag=${encodeURIComponent(params.slug)}&status=published&limit=24`);
  const posts = response?.items || [];

  return (
    <main className="page-shell">
      <section className="section-heading">
        <h1>Tag: {params.slug}</h1>
        <p className="text-slate-600">Articles matching this tag.</p>
      </section>
      <section className="grid-section">
        {posts.length > 0 ? (
          posts.map((post) => <BlogCard key={post._id} post={post} />)
        ) : (
          <p className="text-slate-600">No posts found.</p>
        )}
      </section>
    </main>
  );
}
