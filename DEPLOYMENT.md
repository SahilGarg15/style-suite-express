# ShopEase Deployment Guide

Complete step-by-step guide to deploy ShopEase E-Commerce Platform to production.

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- Neon account (for PostgreSQL database)
- Vercel account (for hosting)

## Part 1: Database Setup (Neon)

### Step 1: Create Neon Account
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up using GitHub or email
3. Verify your email

### Step 2: Create Database Project
1. Click "Create Project"
2. Project Name: `shopease`
3. Database Name: `shopease`
4. Region: Choose closest to your target audience (Mumbai for India)
5. Click "Create Project"

### Step 3: Get Connection Strings
1. Go to project dashboard
2. Click on "Connection String"
3. Copy both connection strings:
   - **Pooled Connection** (for DATABASE_URL)
   - **Direct Connection** (for DIRECT_URL)

They should look like:
```
postgresql://username:password@ep-xxx-xxx.neon.tech/shopease?sslmode=require
```

## Part 2: Local Development Setup

### Step 1: Install Dependencies

```bash
cd style-suite-express
npm install
```

### Step 2: Configure Environment Variables

Create `.env` file in project root:

```env
# Neon Database Connection
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/shopease?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-xxx.neon.tech/shopease?sslmode=require"

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-random-string-min-32-characters"

# Environment
NODE_ENV="development"
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with sample data
npm run prisma:seed
```

### Step 4: Test Locally

```bash
npm run dev
```

Visit `http://localhost:5173` and test:
- Browse products
- Login with: `demo@shopease.in` / `demo123`
- Add items to cart
- Place order

## Part 3: Vercel Deployment

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Link Project

```bash
vercel
```

Follow prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name: `shopease` (or your preferred name)
- Directory: `./` (current directory)
- Override settings? **N**

### Step 4: Add Environment Variables

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings > Environment Variables
4. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| DATABASE_URL | Your Neon pooled connection string | Production, Preview, Development |
| DIRECT_URL | Your Neon direct connection string | Production, Preview, Development |
| JWT_SECRET | Your generated secret key | Production, Preview, Development |

#### Option B: Via CLI
```bash
vercel env add DATABASE_URL production
# Paste your Neon connection string

vercel env add DIRECT_URL production
# Paste your Neon direct connection string

vercel env add JWT_SECRET production
# Paste your JWT secret
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

Wait for deployment to complete. You'll get a production URL like:
```
https://shopease-xxx.vercel.app
```

### Step 6: Verify Deployment

1. Visit your production URL
2. Test all features:
   - Product browsing
   - User signup/login
   - Add to cart
   - Checkout
   - Order tracking

## Part 4: Post-Deployment Configuration

### Enable Custom Domain (Optional)

1. Go to Vercel Dashboard > Your Project
2. Settings > Domains
3. Add your domain (e.g., `shopease.in`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning

### Set Up Production Database

If you want separate databases for development and production:

1. Create another Neon project for production
2. Update Vercel environment variables with production database URLs
3. Redeploy: `vercel --prod`

### Configure CORS (if needed)

Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Authorization, Content-Type" }
      ]
    }
  ]
}
```

## Part 5: Monitoring & Maintenance

### View Logs

```bash
vercel logs
```

Or view in Vercel Dashboard > Your Project > Logs

### Monitor Database

1. Go to Neon Dashboard
2. View your project
3. Check:
   - Query performance
   - Storage usage
   - Connection pool usage

### Update Application

```bash
git add .
git commit -m "Update description"
git push origin main
vercel --prod
```

### Database Migrations

When updating schema:

```bash
# Update prisma/schema.prisma
# Then push changes
npx prisma db push

# Deploy new version
vercel --prod
```

## Part 6: Troubleshooting

### Error: "Cannot connect to database"
- Check DATABASE_URL is correct
- Verify Neon database is running
- Check IP allowlist (Neon allows all by default)

### Error: "Module not found"
- Run `npm install` 
- Check package.json dependencies
- Clear node_modules: `rm -rf node_modules && npm install`

### Error: "JWT token invalid"
- Verify JWT_SECRET is set in environment
- Check token expiry (default 7 days)
- Clear browser cookies/localStorage

### Build Errors
```bash
# Clear build cache
vercel --force

# Check build logs
vercel logs
```

### API Not Working
- Check vercel.json routing
- Verify API files are in `api/` folder
- Check function logs in Vercel Dashboard

## Part 7: Performance Optimization

### Enable Edge Caching

Add to API routes:
```typescript
export const config = {
  runtime: 'edge',
};
```

### Optimize Images
- Use WebP format
- Compress images
- Use CDN for product images

### Database Optimization
- Add indexes to frequently queried fields
- Use connection pooling (Neon does this automatically)
- Monitor slow queries in Neon dashboard

## Part 8: Security Checklist

- [ ] Environment variables secured
- [ ] JWT secret is random and strong
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Input validation on all API endpoints
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Database connection pooling enabled
- [ ] Sensitive data not logged

## Useful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod

# View logs
vercel logs

# View environment variables
vercel env ls

# Open Vercel dashboard
vercel

# Database operations
npx prisma studio        # Open database GUI
npx prisma db push       # Push schema changes
npm run prisma:seed      # Seed database
```

## Support

If you encounter issues:
1. Check error logs in Vercel Dashboard
2. Review Neon database metrics
3. Check GitHub issues
4. Contact support@shopease.in

---

🎉 **Congratulations!** Your ShopEase e-commerce platform is now live!

Visit your production URL and start selling!
