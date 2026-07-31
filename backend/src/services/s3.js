import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

const region = process.env.S3_REGION || 'ap-south-1'
const bucket = process.env.S3_BUCKET || 'bgd-blogs'

const client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_ID
  }
})

export async function uploadFile ({ filename, contentType, body }) {
  const key = `uploads/${Date.now()}-${uuidv4()}-${filename.trim()}`
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    Body: Buffer.from(body, 'base64')
  })
  await client.send(command)
  console.log('upload successfull')

  const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`
  const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key })
  const previewUrl = await getSignedUrl(client, getCommand, { expiresIn: 900 })

  return {
    key,
    previewUrl,
    getCommand,
    s3Url
  }
}
