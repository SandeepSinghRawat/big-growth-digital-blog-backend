import { success, error } from '../utils/response.js';
import { requireAuth } from '../utils/authMiddleware.js';
import { findTags, findTagBySlug, createTag } from '../models/tagModel.js';
import { tagSchema } from '../validators.js';

export async function list() {
  try {
    const items = await findTags();
    return success({ items });
  } catch (err) {
    return error(err.message || 'Unable to list tags', 500);
  }
}

export async function create(event) {
  try {
    requireAuth(event);
    const payload = JSON.parse(event.body || '{}');
    const { error: validationError, value } = tagSchema.validate(payload);
    if (validationError) {
      return error(validationError.message, 400);
    }

    const existing = await findTagBySlug(value.slug);
    if (existing) {
      return error('Tag slug already exists', 409);
    }

    const id = await createTag(value);
    return success({ id }, 201);
  } catch (err) {
    return error(err.message || 'Unable to create tag', 500);
  }
}
