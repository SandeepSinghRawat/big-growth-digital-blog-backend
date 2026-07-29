import { ObjectId } from 'mongodb'
import { success, error } from '../utils/response.js'
import { requireAuth } from '../utils/authMiddleware.js'
import { postSchema } from '../validators.js'
import { normalizePostPayload } from '../services/normalize.js'
import { generateSlug } from '../utils/slug.js'
import { getCollection } from '../services/db.js'

const collectionName = 'posts'

function buildListFilter (query) {
  const filter = {}
  if (query.status) {
    filter.status = query.status
  }
  if (query.category) {
    filter.category = query.category
  }
  if (query.tag) {
    filter.tags = query.tag
  }
  if (query.slug) {
    filter.slug = query.slug
  }
  if (query.published === 'true') {
    filter.status = 'published'
  }
  return filter
}

export async function list (event) {
  try {
    const params = event.queryStringParameters || {}
    const filter = buildListFilter(params)
    const page = Math.max(1, parseInt(params.page || '1', 10))
    const limit = Math.min(24, parseInt(params.limit || '12', 10))
    const skip = (page - 1) * limit

    const collection = await getCollection(collectionName)
    const [items, total] = await Promise.all([
      collection.find(filter).sort({ publishedAt: -1, updatedAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter)
    ])

    return success({ items, page, limit, total, pages: Math.ceil(total / limit) })
  } catch (err) {
    return error(err.message || 'Unable to list posts', 500)
  }
}

export async function getBySlug (event) {
  try {
    const slugOrId = event.pathParameters?.slug
    if (!slugOrId) {
      return error('Slug is required', 400)
    }

    const collection = await getCollection(collectionName)
    let post = null

    if (/^[0-9a-fA-F]{24}$/.test(slugOrId)) {
      try {
        post = await collection.findOne({ _id: new ObjectId(slugOrId) })
      } catch (err) {
        post = null
      }
    }

    if (!post) {
      post = await collection.findOne({ slug: slugOrId })
    }

    if (!post) {
      return error('Post not found', 404)
    }

    return success({ post })
  } catch (err) {
    return error(err.message || 'Unable to fetch post', 500)
  }
}

export async function create (event) {
  try {
    requireAuth(event)
    const payload = JSON.parse(event.body || '{}')
    const { error: validationError, value } = postSchema.validate(payload)
    if (validationError) {
      return error(validationError.message, 400)
    }
    console.log('validate value', value.blocks[0])
    const normalized = normalizePostPayload(value)
    console.log('normalised value', normalized.blocks[0])
    normalized.slug = normalized.slug || generateSlug(normalized.title)
    normalized.publishedAt = normalized.status === 'published' ? normalized.publishedAt || new Date() : null
    normalized.updatedAt = new Date()

    const collection = await getCollection(collectionName)
    console.log('final normalised ***********', normalized.blocks[0])
    const result = await collection.insertOne(normalized)

    return success({ id: result.insertedId, slug: normalized.slug }, 201)
  } catch (err) {
    return error(err.message || 'Unable to create post', 500)
  }
}

export async function update (event) {
  try {
    requireAuth(event)
    const id = event.pathParameters?.id
    if (!id) {
      return error('Post id is required', 400)
    }

    const payload = JSON.parse(event.body || '{}')
    const { error: validationError, value } = postSchema.validate(payload)
    if (validationError) {
      return error(validationError.message, 400)
    }

    const normalized = normalizePostPayload(value)
    console.log('normalized data', normalized)
    normalized.slug = normalized.slug || generateSlug(normalized.title)
    normalized.updatedAt = new Date()
    if (normalized.status === 'published' && !normalized.publishedAt) {
      normalized.publishedAt = new Date()
    }

    const collection = await getCollection(collectionName)
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: normalized, $push: { revisionHistory: { data: normalized, updatedAt: new Date() } } })
    return success({ id })
  } catch (err) {
    return error(err.message || 'Unable to update post', 500)
  }
}

export async function remove (event) {
  try {
    requireAuth(event)
    const id = event.pathParameters?.id
    if (!id) {
      return error('Post id is required', 400)
    }

    const collection = await getCollection(collectionName)
    await collection.deleteOne({ _id: new ObjectId(id) })
    return success({ id, deleted: true })
  } catch (err) {
    return error(err.message || 'Unable to delete post', 500)
  }
}
