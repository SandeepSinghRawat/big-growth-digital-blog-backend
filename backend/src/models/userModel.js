import { getCollection } from '../services/db.js'
import bcrypt from 'bcryptjs'

const collectionName = 'users'

export async function findUserByEmail (email) {
  const collection = await getCollection(collectionName)
  return collection.findOne({ email })
}

export async function createUser (user) {
  const collection = await getCollection(collectionName)
  const passwordHash = await bcrypt.hash(user.password, 10)
  const now = new Date()
  const inserted = await collection.insertOne({
    ...user,
    passwordHash,
    roles: ['editor'],
    createdAt: now,
    updatedAt: now
  })
  return inserted.insertedId
}

export async function verifyPassword (candidate, hashed) {
  return bcrypt.compare(candidate, hashed)
}
