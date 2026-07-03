import slug from 'slug';
import { customAlphabet } from 'nanoid';
import { DEFAULT_CHAR_LIMIT } from '../utils/constant.js';

const generateId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', DEFAULT_CHAR_LIMIT);
export function toSlugBase(text: string): string {
  return slug(text, { lower: true, trim: true, replacement: '-' });
}

export function generateSlug(text: string): string | null {
  if (!text) return null;
  
  const slugifiedText = toSlugBase(text);
  return `${slugifiedText}-${generateId()}`;
}
