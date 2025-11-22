# Subdomain Setup for Product Links

The application now supports subdomain-based product URLs like `my-product.mytrackify.com`.

## How It Works

1. **Product Slugs**: Each product automatically gets a URL-friendly slug generated from its name
2. **Subdomain Routing**: Middleware detects subdomains and routes them to the product page
3. **Link Generation**: Product links are generated as subdomains in production, paths in development

## Local Development

In local development (localhost), the system uses path-based URLs:
- `http://localhost:3000/product/my-product-slug`

This is because subdomains don't work easily with localhost.

## Production Setup

For subdomains to work in production, you need:

### 1. DNS Configuration

Set up a wildcard DNS record pointing to your server:
```
*.mytrackify.com  →  Your server IP
mytrackify.com    →  Your server IP
```

### 2. Environment Variables

Add to your `.env.local` or production environment:
```env
NEXT_PUBLIC_MAIN_DOMAIN=mytrackify.com
```

### 3. Server Configuration

Your hosting provider (Vercel, Netlify, etc.) needs to support wildcard subdomains:

**Vercel:**
- Add the domain in Vercel dashboard
- Add wildcard subdomain: `*.mytrackify.com`
- Vercel automatically handles subdomain routing

**Other Providers:**
- Configure your server to accept all subdomains
- Ensure SSL certificates cover wildcard subdomains

### 4. Testing

Once configured, product links will be:
- `https://my-product-slug.mytrackify.com`
- `https://another-product.mytrackify.com`

## Product Slug Generation

- Slugs are automatically generated from product names
- Special characters are removed
- Spaces become hyphens
- Duplicate slugs get a number suffix (e.g., `my-product-2`)

## Fallback

If subdomain routing fails, the system falls back to path-based URLs:
- `/product/[slug]` or `/product/[id]`

