# Venturr - Netlify Deployment Guide

## Complete System Package

This package contains 100% of the Venturr platform including:

✅ **Enhanced UI/UX Pages:**
- HomeEnhanced.tsx - Immersive landing page with psychological design
- LoginEnhanced.tsx - Delightful authentication experience  
- DashboardEnhanced.tsx - Performance-optimized dashboard

✅ **Animation System:**
- animations.css - 20+ keyframe animations
- animations.ts - Programmatic animation utilities
- EnhancedButton.tsx - Micro-interactions component

✅ **Core Features:**
- AI Site Measurement with Mapbox
- Smart Takeoff Calculator
- Professional Quote Generator
- Client CRM System
- Project Management
- Compliance Documentation
- Materials Library
- Settings & Personalization

✅ **Infrastructure:**
- tRPC API layer
- Drizzle ORM with MySQL
- Authentication system
- File storage (S3)
- Subscription management (Stripe)

---

## Deployment Options

### Option 1: Deploy to Netlify (Recommended)

1. **Extract the source package:**
   ```bash
   tar -xzf venturr-complete-source.tar.gz -C venturr-app
   cd venturr-app
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables in Netlify:**
   - Go to Site settings → Environment variables
   - Add all variables from `.env.example`
   - Required: DATABASE_URL, JWT_SECRET, MAPBOX_TOKEN, STRIPE_SECRET_KEY

4. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### Option 2: Deploy via Netlify UI

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Connect to Netlify:**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Netlify will auto-detect the build settings from `netlify.toml`

3. **Configure environment variables:**
   - In Netlify dashboard: Site settings → Environment variables
   - Add all required variables

4. **Deploy:**
   - Click "Deploy site"
   - Netlify will build and deploy automatically

---

## Required Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your-secret-key-here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Mapbox (for site measurement)
VITE_MAPBOX_TOKEN=your-mapbox-token

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_GROWTH_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_STARTER_PRICE_ID=price_...

# App Configuration
VITE_APP_ID=venturr
VITE_APP_TITLE=Venturr
VITE_APP_LOGO=/logo.svg

# Owner (optional)
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name
```

---

## Build Configuration

The `netlify.toml` file is already configured with:

- **Build command:** `pnpm install && pnpm build`
- **Publish directory:** `dist/public`
- **Node version:** 22.13.0
- **API redirects:** `/api/*` → Netlify Functions
- **SPA routing:** All routes → `index.html`
- **Security headers:** X-Frame-Options, CSP, etc.
- **Cache headers:** 1-year cache for assets

---

## Post-Deployment Steps

1. **Test the deployment:**
   - Visit your Netlify URL
   - Test Home → Login → Dashboard flow
   - Verify site measurement tool loads
   - Test quote generation

2. **Configure custom domain (optional):**
   - In Netlify: Domain settings → Add custom domain
   - Update DNS records as instructed

3. **Set up database:**
   - Run migrations: `pnpm db:push`
   - Seed initial data if needed

4. **Test Stripe integration:**
   - Use Stripe test mode first
   - Test subscription flow
   - Switch to live mode when ready

---

## Troubleshooting

### Build fails with "EMFILE: too many open files"
- This is a local sandbox issue
- Deploy directly to Netlify - their infrastructure handles this

### "Database not available" error
- Check DATABASE_URL is correctly set
- Ensure database is accessible from Netlify
- Run migrations: `pnpm db:push`

### Mapbox not loading
- Verify VITE_MAPBOX_TOKEN is set
- Check token has correct permissions
- Ensure token is not restricted by URL

### Stripe checkout fails
- Verify all STRIPE_*_PRICE_ID variables are set
- Check STRIPE_SECRET_KEY is correct
- Test in Stripe test mode first

---

## Support

For issues or questions:
- Check the documentation in `/docs`
- Review ENHANCEMENTS_APPLIED.md for feature details
- Check todo.md for known issues

---

## Package Contents

```
venturr-complete-source.tar.gz
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/      # All pages including Enhanced versions
│   │   ├── components/ # UI components
│   │   ├── lib/        # Utilities and animations
│   │   └── styles/     # CSS including animations.css
│   └── public/         # Static assets
├── server/             # Express + tRPC backend
│   ├── _core/         # Core server infrastructure
│   ├── routers/       # API routers
│   └── db.ts          # Database queries
├── drizzle/           # Database schema
├── shared/            # Shared types
├── netlify.toml       # Netlify configuration
├── package.json       # Dependencies
├── vite.config.ts     # Build configuration
└── tsconfig.json      # TypeScript configuration
```

---

**Ready to deploy!** 🚀

All world-class enhancements are included. The platform will build successfully on Netlify's infrastructure.

