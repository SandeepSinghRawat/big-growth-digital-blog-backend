import BlogCard from '../../../components/BlogCard.js';
import { fetchApi } from '../../../lib/api.js';

export default async function CategoryPage({ params }) {
  const response = await fetchApi(`/posts?category=${encodeURIComponent(params.slug)}&status=published&limit=24`);
  const posts = response?.items || [];

  return (
    <main className="page-shell">
      <section className="section-heading">
        <h1>Category: {params.slug}</h1>
        <p className="text-slate-600">Browse published articles for this category.</p>
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
