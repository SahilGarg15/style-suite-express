# 🚀 Quick Start Guide - ShopEase

Get your ShopEase e-commerce platform running in 5 minutes!

## Step 1: Database Setup (2 minutes)

### Create Neon Account
1. Go to https://neon.tech
2. Sign up (free tier available)
3. Click "Create Project"
4. Name: `shopease`
5. Region: Select Mumbai (for Indian users)

### Get Connection String
1. In your Neon project dashboard
2. Click "Connection String"
3. Copy the connection string (looks like this):
   ```
   postgresql://username:password@ep-xxx.neon.tech/shopease?sslmode=require
   ```

## Step 2: Environment Configuration (1 minute)

### Create .env file
Create a file named `.env` in the project root:

```env
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/shopease?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-xxx.neon.tech/shopease?sslmode=require"
JWT_SECRET="your-random-secret-key-minimum-32-characters-long"
NODE_ENV="development"
```

### Generate JWT Secret
Run this command to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as JWT_SECRET in .env

## Step 3: Automated Setup (2 minutes)

Run this single command:

```bash
npm run setup
```

This will:
- Install all dependencies
- Generate Prisma client
- Create database tables
- Seed with sample products

## Step 4: Start Development

```bash
npm run dev
```

Visit: http://localhost:5173

## Step 5: Login & Test

**Test Credentials:**
- Email: `demo@shopease.in`
- Password: `demo123`

**Try These:**
1. Browse products
2. Add to cart
3. Checkout
4. Track order

## That's It! 🎉

Your e-commerce platform is ready!

---

## Need Help?

### Common Issues

**"Cannot connect to database"**
- Double-check DATABASE_URL in .env
- Make sure Neon database is running
- URL must end with `?sslmode=require`

**"Command not found: npm"**
- Install Node.js from https://nodejs.org
- Minimum version: 18.0.0

**Setup script fails**
- Run commands manually:
  ```bash
  npm install
  npx prisma generate
  npx prisma db push
  npm run prisma:seed
  ```

### Manual Setup Alternative

If automated setup doesn't work:

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Create database tables
npx prisma db push

# 4. Seed database
npm run prisma:seed

# 5. Start server
npm run dev
```

---

## Next Steps

### View Sample Data
Open Prisma Studio to see database:
```bash
npm run prisma:studio
```

### Deploy to Production
See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment

### Customize
1. Update product images in `/public`
2. Modify colors in `tailwind.config.ts`
3. Add your branding

---

## Quick Commands

```bash
npm run dev              # Start development
npm run build           # Build for production
npm run prisma:studio   # Open database GUI
vercel                  # Deploy to Vercel
```

---

## Support

Issues? Check:
- [Full Documentation](./README_COMPLETE.md)
- [API Docs](./API_DOCS.md)
- [Deployment Guide](./DEPLOYMENT.md)

Happy Coding! 🚀
