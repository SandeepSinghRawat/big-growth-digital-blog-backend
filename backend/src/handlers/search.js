import { success, error } from '../utils/response.js';
import { getCollection } from '../services/db.js';

export async function query(event) {
  try {
    const params = event.queryStringParameters || {};
    const query = String(params.q || '').trim();
    const filter = { status: 'published' };

    if (query) {
      const regex = new RegExp(query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
      filter.$or = [
        { title: regex },
        { slug: regex },
        { category: regex },
        { tags: regex }
      ];
    }

    const collection = await getCollection('posts');
    const items = await collection.find(filter).sort({ publishedAt: -1, updatedAt: -1 }).limit(50).toArray();
    return success({ items });
  } catch (err) {
    return error(err.message || 'Search failed', 500);
  }
}
