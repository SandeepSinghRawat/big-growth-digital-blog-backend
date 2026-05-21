export default function SeoMeta({ title, description, seo = {} }) {
  const metaTitle = seo.metaTitle || title;
  const metaDescription = seo.metaDescription || description;

  return (
    <>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      {seo.canonicalUrl ? <link rel="canonical" href={seo.canonicalUrl} /> : null}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      {seo.openGraph?.image ? <meta property="og:image" content={seo.openGraph.image} /> : null}
    </>
  );
}
