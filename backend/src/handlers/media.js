import { success, error } from '../utils/response.js'
import { requireAuth } from '../utils/authMiddleware.js'
import { uploadFile } from '../services/s3.js'
import { createMediaRecord } from '../models/mediaModel.js'

export async function uploadPresignedUrl (event) {
  try {
    requireAuth(event)
    const payload = JSON.parse(event.body || '{}')
    const filename = String(payload.filename || '').trim()
    const contentType = String(payload.contentType || 'application/octet-stream').trim()
    const altText = String(payload.altText || '').trim()
    const body = String(payload.body || '').trim()

    if (!filename) {
      return error('filename is required', 400)
    }

    if (!body) {
      return error('file body is required', 400)
    }
    console.log('uploading data')
    const upload = await uploadFile({ filename, contentType, body })
    console.log('uploaded data', upload)
    await createMediaRecord({
      filename,
      contentType,
      altText,
      key: upload.key,
      previewUrl: upload.previewUrl,
      s3Url: upload.s3Url
      // getCommand: upload.getCommand
    })

    return success({ previewUrl: upload.previewUrl, s3Url: upload.s3Url, getCommand: upload.getCommand })
  } catch (err) {
    return error(err.message || 'Unable to upload file', 500)
  }
}
