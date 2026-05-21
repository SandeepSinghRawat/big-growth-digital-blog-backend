import { getCollection } from '../services/db.js';
const collectionName = 'tags';

export async function findTags(filter = {}) {
  const collection = await getCollection(collectionName);
  return collection.find(filter).sort({ title: 1 }).toArray();
}

export async function findTagBySlug(slug) {
  const collection = await getCollection(collectionName);
  return collection.findOne({ slug });
}

export async function createTag(tag) {
  const collection = await getCollection(collectionName);
  const now = new Date();
  const inserted = await collection.insertOne({ ...tag, createdAt: now, updatedAt: now });
  return inserted.insertedId;
}
