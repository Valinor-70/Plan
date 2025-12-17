# Deployment Guide for Cloudflare Pages

This guide explains how to deploy the Homework Planner application to Cloudflare Pages.

## Prerequisites

- A Cloudflare account (free tier works fine)
- Git repository connected to GitHub
- Node.js 18+ installed locally for testing

## Cloudflare Pages Deployment

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. **Connect your repository:**
   - Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Go to "Workers & Pages" > "Pages"
   - Click "Create application" > "Pages" > "Connect to Git"
   - Select your GitHub repository (`Valinor-70/Plan`)

2. **Configure build settings:**
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (leave blank)
   - **Node version:** 18 or higher

3. **Environment variables** (if needed):
   - No environment variables are required for the basic deployment
   - All data is stored client-side in localStorage

4. **Deploy:**
   - Click "Save and Deploy"
   - Wait for the build to complete (usually 2-3 minutes)
   - Your site will be available at `https://homework-planner.pages.dev` or your custom domain

### Option 2: Deploy via Wrangler CLI

1. **Install Wrangler:**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate:**
   ```bash
   wrangler login
   ```

3. **Deploy:**
   ```bash
   npm run build
   wrangler pages deploy dist --project-name=homework-planner
   ```

## Custom Domain Setup

1. Go to your Pages project in Cloudflare Dashboard
2. Navigate to "Custom domains"
3. Click "Set up a custom domain"
4. Enter your domain name
5. Follow the instructions to update your DNS records
6. Wait for DNS propagation (usually a few minutes)

## Service Worker Considerations

The application uses a Service Worker for offline functionality and PWA features.

**Important notes:**
- Service Worker is automatically registered on page load
- It caches static assets for offline access
- Updates are applied automatically on next page load
- Clear browser cache if you experience issues after deployment

### Service Worker Testing

Test the Service Worker in production:

1. Open DevTools > Application > Service Workers
2. Verify the Service Worker is "activated and running"
3. Check the Cache Storage to see cached assets
4. Test offline mode by toggling "Offline" in DevTools

## Build Validation

Before deploying, always validate the build locally:

```bash
# Install dependencies
npm install

# Run type checking
npm run build

# Preview the production build
npm run preview
```

Then visit `http://localhost:4321` to test the production build.

## Troubleshooting

### Build Fails

**Problem:** Build fails with TypeScript errors
**Solution:** Run `npm run build` locally and fix any type errors

**Problem:** Out of memory error
**Solution:** Cloudflare Pages has 4GB memory limit. This should be sufficient, but if you hit limits, optimize your bundle size.

### Service Worker Issues

**Problem:** Service Worker not registering
**Solution:** 
- Ensure HTTPS is enabled (required for Service Workers)
- Check browser console for errors
- Clear browser cache and hard reload

**Problem:** Stale content after deployment
**Solution:**
- Update the `CACHE_NAME` in `public/sw.js` when deploying major changes
- Service Worker will automatically update on next visit

### PWA Installation

**Problem:** Install prompt doesn't appear
**Solution:**
- Ensure manifest.json is accessible
- Check that HTTPS is enabled
- PWA installation requires meeting certain criteria (served over HTTPS, has service worker, has manifest)

## Performance Optimization

The app is already optimized for Cloudflare Pages:

- ✅ Static site generation (no server-side rendering)
- ✅ Asset optimization (minification, compression)
- ✅ Code splitting for lazy loading
- ✅ Service Worker caching
- ✅ Global CDN distribution via Cloudflare

Expected Lighthouse scores:
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

## Monitoring

Cloudflare Pages provides analytics:
- Visit "Analytics" tab in your Pages project
- View page views, unique visitors, and bandwidth usage
- Free tier includes unlimited bandwidth

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch triggers automatic deployment
- Pull requests get preview deployments
- Rollback to previous deployments anytime

## Local Development

For local development that mirrors production:

```bash
# Development server with hot reload
npm run dev

# Production build preview
npm run build && npm run preview
```

## Security

The application is secure by default:
- All data stored client-side (no server)
- No external API calls for user data
- Content Security Policy headers configured
- HTTPS enforced by Cloudflare Pages

## Cost

Cloudflare Pages free tier includes:
- **Unlimited bandwidth**
- **Unlimited requests**
- **500 builds per month**
- **1 build at a time**
- **20,000 files per deployment**

This is more than sufficient for most use cases.

## Support

For deployment issues:
- Check [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/)
- Contact Cloudflare support
- Open an issue in the GitHub repository
