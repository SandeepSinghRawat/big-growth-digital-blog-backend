import Link from 'next/link';

export default function BlogCard({ post }) {
  return (
    <article className="card group">
      {post.featuredImage ? (
        <img src={post.featuredImage} alt={post.title} className="card-image" />
      ) : (
        <div className="h-56 bg-slate-100" />
      )}
      <div className="card-body">
        <p className="eyebrow">{post.category || 'Uncategorized'}</p>
        <h2 className="text-2xl font-semibold text-slate-950">{post.title}</h2>
        <p>{post.summary || post.seo?.metaDescription || 'No summary available.'}</p>
        <div className="card-footer">
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
          <Link
            className="font-semibold text-sky-600 transition hover:text-sky-700"
            href={`/blog/${post.slug}`}
          >
            Read article →
          </Link>
        </div>
      </div>
    </article>
  );
}
