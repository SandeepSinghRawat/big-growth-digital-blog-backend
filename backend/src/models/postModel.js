import { ObjectId } from 'mongodb'
import { getCollection } from '../services/db.js'

const collectionName = 'posts'

export async function findPosts (filter = {}, options = {}) {
  const collection = await getCollection(collectionName)
  return collection.find(filter, options).toArray()
}

export async function findPostBySlug (slug) {
  const collection = await getCollection(collectionName)
  return collection.findOne({ slug })
}

export async function findPostById (id) {
  const collection = await getCollection(collectionName)
  if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
    id = new ObjectId(id)
  }
  return collection.findOne({ _id: id })
}

export async function createPost (post) {
  const collection = await getCollection(collectionName)
  const now = new Date()
  const inserted = await collection.insertOne({
    ...post,
    createdAt: now,
    updatedAt: now,
    revisionHistory: [{ data: post, updatedAt: now }]
  })
  return inserted.insertedId
}

export async function updatePost (id, update) {
  const collection = await getCollection(collectionName)
  const now = new Date()
  const revisionEntry = { data: update, updatedAt: now }
  await collection.updateOne({ _id: id }, { $set: { ...update, updatedAt: now }, $push: { revisionHistory: revisionEntry } })
}

export async function deletePost (id) {
  const collection = await getCollection(collectionName)
  await collection.deleteOne({ _id: id })
}
