import Joi from 'joi'
import { blockTypes } from './services/normalize.js'

export const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
})

export const postSchema = Joi.object({
  _id: Joi.string().optional(),
  title: Joi.string().trim().required(),
  slug: Joi.string().trim().required(),
  summary: Joi.string().allow('').max(1000),
  featuredImage: Joi.string().uri().allow(''),
  category: Joi.string().trim().required(),
  tags: Joi.array().items(Joi.string().trim().required()).default([]),
  status: Joi.string().valid('draft', 'published').default('draft'),
  publishedAt: Joi.date().iso().allow(null),
  blocks: Joi.array()
    .items(Joi.object({ type: Joi.string().valid(...Array.from(blockTypes)).required() }).unknown(true))
    .default([]),
  seo: Joi.object({
    metaTitle: Joi.string().trim().allow(''),
    metaDescription: Joi.string().trim().allow(''),
    primaryKeyword: Joi.string().trim().allow(''),
    secondaryKeywords: Joi.array().items(Joi.string().trim()).default([]),
    canonicalUrl: Joi.string().uri().allow(''),
    openGraph: Joi.object().default({})
  }).default({}),
  relatedPosts: Joi.array().items(Joi.string()).default([]),
  updatedAt: Joi.string().optional()
})

export const categorySchema = Joi.object({
  title: Joi.string().trim().required(),
  slug: Joi.string().trim().required(),
  description: Joi.string().trim().allow('')
})

export const tagSchema = Joi.object({
  title: Joi.string().trim().required(),
  slug: Joi.string().trim().required()
})
