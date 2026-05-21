export const blockTypes = new Set([
  'heading',
  'paragraph',
  'section',
  'image',
  'video',
  'quote',
  'cta',
  'faq',
  'table',
  'code',
  'list',
  'divider',
  'author',
  'toc',
  'html'
]);

export function normalizeBlock(block) {
  if (!block || typeof block !== 'object' || !block.type) {
    return null;
  }

  const type = String(block.type).toLowerCase();
  if (!blockTypes.has(type)) {
    return null;
  }

  const normalized = {
    type,
    ...block
  };

  if (type === 'heading') {
    normalized.level = Math.min(6, Math.max(1, parseInt(block.level, 10) || 2));
    normalized.text = String(block.text || '').trim();
  }

  if (type === 'paragraph') {
    normalized.text = String(block.text || '').trim();
    normalized.children = Array.isArray(block.children)
      ? block.children.map(normalizeBlock).filter(Boolean)
      : [];
  }

  if (type === 'section') {
    normalized.heading = String(block.heading || '').trim();
    normalized.headingLevel = Math.min(6, Math.max(1, parseInt(block.headingLevel, 10) || 2));
    normalized.children = Array.isArray(block.children)
      ? block.children.map(normalizeBlock).filter(Boolean)
      : [];
  }

  if (type === 'list') {
    normalized.style = block.style === 'ordered' ? 'ordered' : 'unordered';
    
    function normalizeListItems(items) {
      if (!Array.isArray(items)) return [];
      return items.map((item) => {
        if (typeof item === 'string') {
          return { text: String(item).trim(), style: 'unordered', children: [] };
        }
        return {
          text: String(item.text || '').trim(),
          style: item.style === 'ordered' ? 'ordered' : 'unordered',
          children: normalizeListItems(item.children)
        };
      });
    }
    
    normalized.items = normalizeListItems(block.items);
  }

  if (type === 'faq') {
    normalized.items = Array.isArray(block.items)
      ? block.items.map((item) => ({
          question: String(item.question || '').trim(),
          answer: String(item.answer || '').trim()
        }))
      : [];
  }

  if (type === 'table') {
    normalized.headers = Array.isArray(block.headers) ? block.headers.map(String) : [];
    normalized.rows = Array.isArray(block.rows) ? block.rows.map((row) => Array.isArray(row) ? row.map(String) : []) : [];
  }

  return normalized;
}

export function normalizePostPayload(payload) {
  const blocks = Array.isArray(payload.blocks)
    ? payload.blocks.map(normalizeBlock).filter(Boolean)
    : [];

  const status = payload.status === 'published' ? 'published' : 'draft';
  let publishedAt = null;

  if (payload.publishedAt) {
    const date = new Date(payload.publishedAt);
    if (!Number.isNaN(date.getTime())) {
      publishedAt = date;
    }
  }

  if (!publishedAt && status === 'published') {
    publishedAt = new Date();
  }

  return {
    title: String(payload.title || '').trim(),
    slug: String(payload.slug || '').trim(),
    summary: String(payload.summary || '').trim(),
    featuredImage: String(payload.featuredImage || '').trim(),
    status,
    seo: {
      metaTitle: String(payload.seo?.metaTitle || payload.title || '').trim(),
      metaDescription: String(payload.seo?.metaDescription || '').trim(),
      primaryKeyword: String(payload.seo?.primaryKeyword || '').trim(),
      secondaryKeywords: Array.isArray(payload.seo?.secondaryKeywords)
        ? payload.seo.secondaryKeywords.map(String).filter(Boolean)
        : [],
      canonicalUrl: String(payload.seo?.canonicalUrl || '').trim(),
      openGraph: payload.seo?.openGraph || {}
    },
    category: String(payload.category || '').trim(),
    tags: Array.isArray(payload.tags) ? payload.tags.map(String).filter(Boolean) : [],
    blocks,
    publishedAt,
    relatedPosts: Array.isArray(payload.relatedPosts) ? payload.relatedPosts.map(String) : []
  };
}
