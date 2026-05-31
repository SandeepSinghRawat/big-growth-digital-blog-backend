import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'blogcms'

if (!uri) {
  throw new Error('MONGODB_URI is required')
}

let cachedClient = null
let cachedDb = null
let indexesCreated = false

async function createIndexes (db) {
  if (indexesCreated) {
    return
  }

  try {
    // Create indexes asynchronously without waiting
    // This prevents blocking the handler execution
    Promise.all([
      db.collection('posts').createIndexes([
        { key: { title: 'text', slug: 'text', tags: 'text', category: 'text' }, name: 'search_text_index' },
        { key: { slug: 1 }, name: 'slug_index', unique: true },
        { key: { publishedAt: -1 }, name: 'published_at_index' }
      ]),
      db.collection('categories').createIndexes([
        { key: { slug: 1 }, name: 'category_slug_index', unique: true }
      ]),
      db.collection('tags').createIndexes([
        { key: { slug: 1 }, name: 'tag_slug_index', unique: true }
      ]),
      db.collection('users').createIndexes([
        { key: { email: 1 }, name: 'user_email_index', unique: true }
      ])
    ]).catch(err => {
      console.warn('Index creation warning:', err.message)
    })
    indexesCreated = true
  } catch (err) {
    console.warn('Index creation error:', err.message)
    indexesCreated = true
  }
}

export async function connectToDatabase () {
  if (cachedDb && cachedClient) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(uri, {
    serverApi: '1',
    maxPoolSize: 10,
    minPoolSize: 1,
    appName: 'big-growth-bgd-blogs',
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 90000,
    connectTimeoutMS: 10000,
    family: 4,
    retryWrites: true
  })

  let retries = 0
  const maxRetries = 3

  while (retries < maxRetries) {
    try {
      console.log(`Attempting MongoDB connection (attempt ${retries + 1}/${maxRetries})...`)
      await client.connect()
      console.log('MongoDB connected successfully')
      const db = client.db(dbName)
      createIndexes(db)
      cachedClient = client
      cachedDb = db
      return { client, db }
    } catch (err) {
      retries++
      console.error(`MongoDB connection attempt ${retries} failed:`, err.message)
      if (retries >= maxRetries) {
        throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts: ${err.message}`)
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * retries))
    }
  }
}

export async function getCollection (name) {
  const { db } = await connectToDatabase()
  return db.collection(name)
}
