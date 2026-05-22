import { getCollection } from '../services/db.js'
const collectionName = 'media'

export async function createMediaRecord (record) {
  const collection = await getCollection(collectionName)
  const now = new Date()
  const inserted = await collection.insertOne({ ...record, createdAt: now, updatedAt: now })
  return inserted.insertedId
}

export async function findMedia (filter = {}) {
  const collection = await getCollection(collectionName)
  return collection.find(filter).sort({ createdAt: -1 }).toArray()
}
