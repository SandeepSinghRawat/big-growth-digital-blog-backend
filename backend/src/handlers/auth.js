import { success, error } from '../utils/response.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../services/auth.js'
import { findUserByEmail, verifyPassword } from '../models/userModel.js'
import { authSchema } from '../validators.js'

export async function login (event) {
  try {
    const payload = JSON.parse(event.body || '{}')
    const { error: validationError, value } = authSchema.validate(payload)
    if (validationError) {
      return error(`${validationError.message} test`, 400)
    }

    const user = await findUserByEmail(value.email)
    console.log('user data', user, value)
    if (!user || !(await verifyPassword(value.password, user.passwordHash))) {
      return error('Invalid email or password', 401)
    }

    const authPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name || 'Editor'
    }
    console.log('auth payload', authPayload)

    return success({
      accessToken: signAccessToken(authPayload),
      refreshToken: signRefreshToken(authPayload),
      user: authPayload
    })
  } catch (err) {
    return error(err.message || 'Login failed', 500)
  }
}

export async function refresh (event) {
  try {
    const payload = JSON.parse(event.body || '{}')
    const token = payload.refreshToken
    if (!token) {
      return error('Refresh token required', 400)
    }

    const decoded = verifyRefreshToken(token)
    const authPayload = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name
    }

    return success({
      accessToken: signAccessToken(authPayload),
      refreshToken: signRefreshToken(authPayload),
      user: authPayload
    })
  } catch (err) {
    return error(err.message || 'Refresh failed', 401)
  }
}
