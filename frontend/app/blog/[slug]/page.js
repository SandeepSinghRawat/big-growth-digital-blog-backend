import BlogBlockRenderer from '../../../components/BlogBlockRenderer.js';
import SeoMeta from '../../../components/SeoMeta.js';
import JsonLd from '../../../components/JsonLd.js';
import { fetchApi } from '../../../lib/api.js';

export async function generateMetadata({ params }) {
  const data = await fetchApi(`/posts/${params.slug}`);
  const post = data?.post;
  return {
    title: post?.seo?.metaTitle || post?.title,
    description: post?.seo?.metaDescription || post?.summary,
    openGraph: {
      title: post?.seo?.metaTitle || post?.title,
      description: post?.seo?.metaDescription,
      images: post?.featuredImage ? [{ url: post.featuredImage }] : []
    }
  };
}

export default async function BlogPage({ params }) {
  const data = await fetchApi(`/posts/${params.slug}`);
  const post = data?.post;

  if (!post) {
    return (
      <main className="page-shell">
        <p className="text-slate-600">Post not found.</p>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <SeoMeta seo={post.seo} title={post.title} description={post.summary} />
      <JsonLd post={post} />
      <article className="blog-post">
        <header className="space-y-4">
          <p className="eyebrow">{post.category || 'Uncategorized'}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{post.title}</h1>
          <p className="post-meta">Published: {new Date(post.publishedAt).toLocaleDateString()}</p>
        </header>
        {post.featuredImage ? (
          <img
            src={post.featuredImage}
            alt={post.seo?.metaTitle || post.title}
            className="featured-image"
          />
        ) : null}
        <section className="content-blocks">
          <BlogBlockRenderer blocks={post.blocks} />
        </section>
      </article>
    </main>
  );
}
