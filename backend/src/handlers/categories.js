import { success, error } from '../utils/response.js';
import { requireAuth } from '../utils/authMiddleware.js';
import { findCategories, findCategoryBySlug, createCategory } from '../models/categoryModel.js';
import { categorySchema } from '../validators.js';

export async function list() {
  try {
    const items = await findCategories();
    return success({ items });
  } catch (err) {
    return error(err.message || 'Unable to list categories', 500);
  }
}

export async function create(event) {
  try {
    requireAuth(event);
    const payload = JSON.parse(event.body || '{}');
    const { error: validationError, value } = categorySchema.validate(payload);
    if (validationError) {
      return error(validationError.message, 400);
    }

    const existing = await findCategoryBySlug(value.slug);
    if (existing) {
      return error('Category slug already exists', 409);
    }

    const id = await createCategory(value);
    return success({ id }, 201);
  } catch (err) {
    return error(err.message || 'Unable to create category', 500);
  }
}
