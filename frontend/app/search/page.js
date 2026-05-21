import BlogCard from '../../components/BlogCard.js';
import { fetchApi } from '../../lib/api.js';

export default async function SearchPage({ searchParams }) {
  const query = String(searchParams.q || '').trim();
  const response = query ? await fetchApi(`/search?q=${encodeURIComponent(query)}`) : { items: [] };
  const posts = response?.items || [];

  return (
    <main className="page-shell">
      <section className="section-heading">
        <h1>Search results</h1>
        <p className="text-slate-600">{query ? `Results for “${query}”` : 'Type a search term to discover posts.'}</p>
      </section>
      <section className="grid-section">
        {posts.length > 0 ? (
          posts.map((post) => <BlogCard key={post._id} post={post} />)
        ) : (
          <p className="text-slate-600">No matching posts.</p>
        )}
      </section>
    </main>
  );
}
