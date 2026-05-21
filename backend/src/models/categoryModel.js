import { getCollection } from '../services/db.js';
const collectionName = 'categories';

export async function findCategories(filter = {}) {
  const collection = await getCollection(collectionName);
  return collection.find(filter).sort({ title: 1 }).toArray();
}

export async function findCategoryBySlug(slug) {
  const collection = await getCollection(collectionName);
  return collection.findOne({ slug });
}

export async function createCategory(category) {
  const collection = await getCollection(collectionName);
  const now = new Date();
  const inserted = await collection.insertOne({ ...category, createdAt: now, updatedAt: now });
  return inserted.insertedId;
}
