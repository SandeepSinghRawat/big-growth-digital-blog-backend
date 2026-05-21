import { createUser, findUserByEmail } from './models/userModel.js'

const adminEmail = process.env.ADMIN_EMAIL || 'admin@blogcms.local'
const adminPassword = process.env.ADMIN_PASSWORD || 'StrongPassword123!'

async function run () {
  const existing = await findUserByEmail(adminEmail)
  if (existing) {
    console.log('Admin user already exists:', adminEmail)
    process.exit(0)
  }

  const id = await createUser({
    name: 'Admin User',
    email: adminEmail,
    password: adminPassword
  })
  console.log('Created admin user with id:', id.toString())
  process.exit(0)
}

run().catch((err) => {
  console.error('Failed to seed admin user', err)
  process.exit(1)
})
