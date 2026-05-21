import { success } from '../utils/response.js';

export function ping() {
  return success({ status: 'ok', service: 'big-growth-bgd-blogs' });
}
