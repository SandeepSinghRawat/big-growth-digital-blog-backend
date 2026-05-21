import { verifyAccessToken } from '../services/auth.js';

export function requireAuth(event) {
  const authorization = event.headers?.authorization || event.headers?.Authorization || '';
  const token = String(authorization).replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    const error = new Error('Authorization header required');
    error.statusCode = 401;
    throw error;
  }
  return verifyAccessToken(token);
}
