export default function JsonLd({ post }) {
  if (!post) {
    return null;
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.seo?.metaDescription || post.summary,
    author: { '@type': 'Person', name: post.author || 'Editorial Team' },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.seo?.canonicalUrl || `${process.env.NEXT_PUBLIC_API_BASE_URL}/blog/${post.slug}`
    },
    image: post.featuredImage ? [post.featuredImage] : []
  };

  const faqSchema = post.blocks
    ?.filter((block) => block.type === 'faq')
    .flatMap((block) => (block.items || []).map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    })));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema?.length ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqSchema
        }) }} />
      ) : null}
    </>
  );
}
