import jwt from 'jsonwebtoken'

const accessSecret = process.env.JWT_SECRET
const refreshSecret = process.env.JWT_REFRESH_SECRET
const accessExpires = process.env.JWT_ACCESS_EXPIRES || '7d'
const refreshExpires = process.env.JWT_REFRESH_EXPIRES || '7d'

if (!accessSecret || !refreshSecret) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET are required')
}

export function signAccessToken (payload) {
  return jwt.sign(payload, accessSecret, { expiresIn: accessExpires })
}

export function signRefreshToken (payload) {
  return jwt.sign(payload, refreshSecret, { expiresIn: refreshExpires })
}

export function verifyAccessToken (token) {
  return jwt.verify(token, accessSecret)
}

export function verifyRefreshToken (token) {
  return jwt.verify(token, refreshSecret)
}
