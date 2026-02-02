/**
 * Utility functions for generating URL-friendly slugs.
 */

/**
 * Converts a Vietnamese string to its ASCII equivalent.
 * Removes diacritics and special characters.
 */
function removeVietnameseDiacritics(str: string): string {
  const diacriticsMap: Record<string, string> = {
    à: 'a',
    á: 'a',
    ả: 'a',
    ã: 'a',
    ạ: 'a',
    ă: 'a',
    ằ: 'a',
    ắ: 'a',
    ẳ: 'a',
    ẵ: 'a',
    ặ: 'a',
    â: 'a',
    ầ: 'a',
    ấ: 'a',
    ẩ: 'a',
    ẫ: 'a',
    ậ: 'a',
    è: 'e',
    é: 'e',
    ẻ: 'e',
    ẽ: 'e',
    ẹ: 'e',
    ê: 'e',
    ề: 'e',
    ế: 'e',
    ể: 'e',
    ễ: 'e',
    ệ: 'e',
    ì: 'i',
    í: 'i',
    ỉ: 'i',
    ĩ: 'i',
    ị: 'i',
    ò: 'o',
    ó: 'o',
    ỏ: 'o',
    õ: 'o',
    ọ: 'o',
    ô: 'o',
    ồ: 'o',
    ố: 'o',
    ổ: 'o',
    ỗ: 'o',
    ộ: 'o',
    ơ: 'o',
    ờ: 'o',
    ớ: 'o',
    ở: 'o',
    ỡ: 'o',
    ợ: 'o',
    ù: 'u',
    ú: 'u',
    ủ: 'u',
    ũ: 'u',
    ụ: 'u',
    ư: 'u',
    ừ: 'u',
    ứ: 'u',
    ử: 'u',
    ữ: 'u',
    ự: 'u',
    ỳ: 'y',
    ý: 'y',
    ỷ: 'y',
    ỹ: 'y',
    ỵ: 'y',
    đ: 'd',
    À: 'A',
    Á: 'A',
    Ả: 'A',
    Ã: 'A',
    Ạ: 'A',
    Ă: 'A',
    Ằ: 'A',
    Ắ: 'A',
    Ẳ: 'A',
    Ẵ: 'A',
    Ặ: 'A',
    Â: 'A',
    Ầ: 'A',
    Ấ: 'A',
    Ẩ: 'A',
    Ẫ: 'A',
    Ậ: 'A',
    È: 'E',
    É: 'E',
    Ẻ: 'E',
    Ẽ: 'E',
    Ẹ: 'E',
    Ê: 'E',
    Ề: 'E',
    Ế: 'E',
    Ể: 'E',
    Ễ: 'E',
    Ệ: 'E',
    Ì: 'I',
    Í: 'I',
    Ỉ: 'I',
    Ĩ: 'I',
    Ị: 'I',
    Ò: 'O',
    Ó: 'O',
    Ỏ: 'O',
    Õ: 'O',
    Ọ: 'O',
    Ô: 'O',
    Ồ: 'O',
    Ố: 'O',
    Ổ: 'O',
    Ỗ: 'O',
    Ộ: 'O',
    Ơ: 'O',
    Ờ: 'O',
    Ớ: 'O',
    Ở: 'O',
    Ỡ: 'O',
    Ợ: 'O',
    Ù: 'U',
    Ú: 'U',
    Ủ: 'U',
    Ũ: 'U',
    Ụ: 'U',
    Ư: 'U',
    Ừ: 'U',
    Ứ: 'U',
    Ử: 'U',
    Ữ: 'U',
    Ự: 'U',
    Ỳ: 'Y',
    Ý: 'Y',
    Ỷ: 'Y',
    Ỹ: 'Y',
    Ỵ: 'Y',
    Đ: 'D',
  };

  return str
    .split('')
    .map((char) => diacriticsMap[char] || char)
    .join('');
}

/**
 * Converts a string to a URL-friendly slug.
 * - Removes Vietnamese diacritics
 * - Converts to lowercase
 * - Replaces spaces and special characters with hyphens
 * - Removes consecutive hyphens
 * - Trims hyphens from start and end
 *
 * @param text - The text to convert to a slug
 * @param maxLength - Maximum length of the slug (default: 200)
 * @returns A URL-friendly slug
 */
export function slugify(text: string, maxLength = 200): string {
  return removeVietnameseDiacritics(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Trim hyphens from start and end
    .substring(0, maxLength); // Limit length
}

/**
 * Generates a product slug with the format: <name-slug>-i.<shopId>.<productId>
 * This format ensures uniqueness and allows easy extraction of IDs.
 *
 * @param name - The product name
 * @param shopId - The shop's UUID
 * @param productId - The product's UUID
 * @returns A unique product slug
 */
export function generateProductSlug(
  name: string,
  shopId: string,
  productId: string,
): string {
  const nameSlug = slugify(name, 150); // Leave room for the suffix
  return `${nameSlug}-i.${shopId}.${productId}`;
}

/**
 * Parses a product slug to extract shopId and productId.
 * Expected format: <name-slug>-i.<shopId>.<productId>
 *
 * @param slug - The product slug
 * @returns Object with shopId and productId, or null if parsing fails
 */
export function parseProductSlug(
  slug: string,
): { shopId: string; productId: string } | null {
  const match = slug.match(/-i\.([0-9a-f-]+)\.([0-9a-f-]+)$/i);
  if (!match) {
    return null;
  }
  return {
    shopId: match[1],
    productId: match[2],
  };
}
