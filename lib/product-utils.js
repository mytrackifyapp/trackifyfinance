/**
 * Generate a URL-friendly slug from a product name
 */
export function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if needed
 */
export function generateUniqueSlug(name, existingSlugs = []) {
  let baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Generate product URL with subdomain
 */
export function getProductUrl(product, baseDomain = null) {
  if (typeof window === "undefined") {
    // Server-side: use path-based URL
    const identifier = product.slug || product.id;
    return `/product/${identifier}`;
  }
  
  const domain = baseDomain || window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // Use slug if available, otherwise fall back to ID
  const identifier = product.slug || product.id;
  
  // For localhost or development, always use path-based routing
  if (domain.includes("localhost") || domain.includes("127.0.0.1") || domain.includes("0.0.0.0") || port) {
    const host = port ? `${domain}:${port}` : domain;
    return `${protocol}//${host}/product/${identifier}`;
  }
  
  // For production, use subdomain (only if not localhost)
  return `${protocol}//${identifier}.${domain}`;
}

