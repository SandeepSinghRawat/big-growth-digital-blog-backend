import { getCollection } from '../../services/db'
import { error, success } from '../../utils/response'
const collectionName = 'posts'
export const fetchBlogsSitemap = async (event) => {
  try {
    const collection = await getCollection(collectionName)
    const blogs = await collection.find({ status: 'published' }, { projection: { slug: 1, seo: 1, updatedAt: 1, publishedAt: 1 } }).toArray()
    const sitemap = blogs.map((blog) => ({
      loc: `${process.env.SITE_URL}/blogs/${blog.slug}`,
      lastmod: blog.updatedAt || blog.publishedAt || new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8
    }))

    return success({ sitemap })
  } catch (err) {
    return error(err.message || 'Unable to fetch sitemap', 500)
  }
}
