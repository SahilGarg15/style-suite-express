# 🛍️ ShopEase - Complete E-Commerce Platform

A production-ready, full-stack e-commerce platform built specifically for the Indian market. Features modern UI/UX, secure authentication, real-time order tracking, and seamless payment integration.

## ✨ Key Features

### 🎨 Frontend
- **Modern Stack**: React 18, TypeScript, Vite, Tailwind CSS
- **Beautiful UI**: 60+ pre-built shadcn/ui components
- **Responsive Design**: Mobile-first approach, works on all devices
- **Fast Performance**: Optimized with code splitting and lazy loading
- **User Experience**: Smooth animations, toast notifications, loading states

### 🔐 Authentication & Security
- JWT-based authentication with 7-day expiry
- Secure password hashing (bcrypt, 12 rounds)
- Protected API routes with middleware
- Input validation and sanitization
- XSS and SQL injection prevention

### 🛒 Shopping Features
- Advanced product search and filtering
- Category-based browsing (Men, Women, Children)
- Product variations (sizes, colors)
- Shopping cart with persistent state
- Wishlist functionality
- Product reviews and ratings

### 📦 Order Management
- Multi-step checkout process
- Real-time order tracking with timeline
- Order history for authenticated users
- Guest order tracking by order number
- Automatic email notifications (ready to integrate)
- Support for multiple delivery addresses

### 💰 Payment & Pricing (Indian Market)
- Prices in Indian Rupees (₹)
- 18% GST automatic calculation
- Free shipping above ₹500
- Multiple payment methods:
  - Cash on Delivery (COD)
  - UPI
  - Credit/Debit Cards
  - Digital Wallets

### 🗄️ Database & Backend
- **Neon PostgreSQL**: Serverless, auto-scaling database
- **Prisma ORM**: Type-safe database access
- **Vercel Functions**: Serverless API endpoints
- Connection pooling and query optimization
- Comprehensive data models for all entities

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Neon account (free tier available)
- Vercel account (free tier available)

### 1. Clone & Install

```bash
cd style-suite-express
npm install
```

### 2. Configure Database

1. Create account at [Neon](https://neon.tech)
2. Create new project: `shopease`
3. Copy connection strings
4. Create `.env` file:

```env
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/shopease?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-xxx.neon.tech/shopease?sslmode=require"
JWT_SECRET="your-random-32-character-secret-key"
NODE_ENV="development"
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Run Automated Setup

```bash
npm run setup
```

This will:
- ✅ Install all dependencies
- ✅ Generate Prisma Client
- ✅ Create database tables
- ✅ Seed with sample data

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### 5. Test the Application

**Login Credentials:**
- Email: `demo@shopease.in`
- Password: `demo123`

**Try these features:**
- Browse products by category
- Search for products
- Add items to cart
- Complete checkout
- Track your order
- View order history

## 📁 Project Structure

```
style-suite-express/
├── api/                      # Vercel serverless functions
│   ├── auth/                # Authentication endpoints
│   │   ├── login.ts         # User login
│   │   └── signup.ts        # User registration
│   ├── orders/              # Order management
│   │   ├── create.ts        # Create order
│   │   ├── my-orders.ts     # User's orders
│   │   └── track.ts         # Track order
│   ├── products/            # Product endpoints
│   │   ├── index.ts         # List products
│   │   └── [id].ts          # Single product
│   └── users/               # User management
│       └── profile.ts       # User profile
├── prisma/                  # Database configuration
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Sample data seeding
├── src/                     # Frontend source code
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Navbar.tsx      # Navigation bar
│   │   ├── Footer.tsx      # Footer
│   │   └── ProductCard.tsx # Product display
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx     # Authentication state
│   │   ├── CartContext.tsx     # Shopping cart state
│   │   └── WishlistContext.tsx # Wishlist state
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Home page
│   │   ├── Shop.tsx        # Product listing
│   │   ├── ProductDetail.tsx # Product details
│   │   ├── Cart.tsx        # Shopping cart
│   │   ├── Checkout.tsx    # Checkout process
│   │   ├── Account.tsx     # User account
│   │   ├── Auth.tsx        # Login/Signup
│   │   ├── TrackOrder.tsx  # Order tracking
│   │   └── Wishlist.tsx    # Wishlist
│   ├── types/              # TypeScript definitions
│   └── lib/                # Utility functions
├── lib/                    # Backend utilities
│   └── prisma.ts          # Prisma client
├── vercel.json            # Vercel configuration
├── .env                   # Environment variables
└── package.json           # Dependencies

```

## 🗄️ Database Schema

### Core Models
- **User** - User accounts with authentication
- **Product** - Product catalog with variants
- **Category** - Product categories
- **Order** - Order management
- **OrderItem** - Order line items
- **OrderTracking** - Real-time tracking
- **Review** - Product reviews
- **Favorite** - User wishlist
- **Address** - Saved addresses
- **OTPCode** - Email verification codes

### Relationships
- User → Orders (one-to-many)
- User → Reviews (one-to-many)
- User → Favorites (one-to-many)
- Order → OrderItems (one-to-many)
- Order → OrderTracking (one-to-one)
- Product → Reviews (one-to-many)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/[id]` - Get product details

### Orders
- `POST /api/orders/create` - Create order (auth required)
- `GET /api/orders/my-orders` - User's orders (auth required)
- `GET /api/orders/track?orderNumber=XXX` - Track order

### Users
- `GET /api/users/profile` - Get profile (auth required)
- `PUT /api/users/profile` - Update profile (auth required)

**Full API documentation:** See [API_DOCS.md](./API_DOCS.md)

## 🚢 Production Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Configure Environment Variables:**

In Vercel Dashboard → Settings → Environment Variables, add:
- `DATABASE_URL` - Neon connection string
- `DIRECT_URL` - Neon direct connection string  
- `JWT_SECRET` - Your JWT secret key

**Detailed deployment guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛠️ Development Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build

# Database
npm run prisma:generate    # Generate Prisma Client
npm run prisma:push        # Push schema to database
npm run prisma:seed        # Seed with sample data
npm run prisma:studio      # Open database GUI

# Deployment
vercel                     # Deploy to Vercel
vercel --prod             # Deploy to production
vercel logs               # View logs
```

## 🧪 Testing

### Test User Accounts

```
Demo User:
Email: demo@shopease.in
Password: demo123

Admin User:
Email: admin@shopease.in
Password: demo123
```

### Sample Products
- 30+ products across categories
- Men's traditional and western wear
- Women's sarees, suits, and dresses
- Children's ethnic and casual wear
- Accessories and footwear

## 📱 Features by Category

### 👔 Men's Fashion
- Traditional wear (Kurtas, Sherwanis, Dhoti Sets)
- Western wear (Shirts, Trousers, Jeans, Jackets)
- Footwear (Formal shoes, Mojaris)
- Accessories (Belts, Watches, Pocket squares)

### 👗 Women's Fashion
- Sarees (Cotton, Banarasi Silk, Georgette)
- Suits (Anarkali, Palazzo, Salwar)
- Kurtis (Cotton, Block print)
- Indo-Western (Fusion dresses, Crop tops)
- Accessories (Handbags, Jewelry, Sandals)

### 👶 Children's Fashion
- Boys (Kurta sets, Bandhgala, Casual wear)
- Girls (Lehengas, Anarkali, Party dresses)
- Casual wear (T-shirts, Denim, Skirts)

## 🔒 Security Features

- ✅ JWT authentication with secure tokens
- ✅ Password hashing with bcrypt
- ✅ Environment variable protection
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ HTTPS enforcement (Vercel)
- ✅ Secure headers configuration
- ✅ Rate limiting ready
- ✅ Input validation

## 🌐 Indian Market Optimization

- 💰 Prices in Indian Rupees (₹)
- 📍 Indian address format (State-based)
- 🚚 Delivery estimation (7 days)
- 💳 Payment methods (COD, UPI, Cards)
- 📱 Phone number with +91 prefix
- 🏪 GST calculation (18%)
- 🎁 Free shipping threshold (₹500)
- 🕉️ Traditional wear categories
- 📅 Indian festivals consideration

## 🎨 Tech Stack Details

### Frontend Dependencies
- React 18.3.1
- TypeScript 5.8.3
- Vite 5.4.19
- Tailwind CSS 3.4.17
- React Router 6.30.1
- TanStack Query 5.83.0
- shadcn/ui components
- Lucide React icons
- React Hook Form
- Zod validation
- Sonner toasts

### Backend Dependencies
- @prisma/client 6.5.0
- @vercel/node 3.2.22
- bcryptjs 2.4.3
- jsonwebtoken 9.0.2

### Development Tools
- ESLint 9.32.0
- Prisma 6.5.0
- TypeScript ESLint
- Autoprefixer
- PostCSS

## 📊 Performance Optimizations

- ⚡ Code splitting and lazy loading
- 🖼️ Image optimization ready
- 🔄 Connection pooling (Neon)
- 💾 Database query optimization
- 📦 Bundle size optimization
- 🚀 CDN delivery (Vercel)
- 🗜️ Gzip compression
- 💨 Edge caching ready

## 🐛 Troubleshooting

### Common Issues

**Database connection error:**
- Check DATABASE_URL in .env
- Verify Neon database is active
- Ensure connection string has `?sslmode=require`

**Build fails:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist && npm run build`
- Check all environment variables are set

**JWT token invalid:**
- Verify JWT_SECRET is set
- Check token hasn't expired (7 days)
- Clear browser localStorage

**API not responding:**
- Check vercel.json routing
- Verify API files are in correct location
- Check Vercel function logs

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Step-by-step deployment instructions
- [API Documentation](./API_DOCS.md) - Complete API reference
- [Database Schema](./prisma/schema.prisma) - Prisma schema with all models

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful UI components
- **Neon** - Serverless PostgreSQL
- **Vercel** - Deployment platform
- **Prisma** - Database ORM
- **TailwindCSS** - Utility-first CSS

## 📞 Support

- 📧 Email: support@shopease.in
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

## 🎯 Roadmap

### Coming Soon
- [ ] Email notifications (Resend/SendGrid)
- [ ] SMS notifications (Twilio)
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Admin dashboard
- [ ] Analytics and reports
- [ ] Product recommendations
- [ ] Advanced search with filters
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)
- [ ] Social login (Google, Facebook)

### Future Enhancements
- [ ] Mobile app (React Native)
- [ ] Seller marketplace
- [ ] Auction system
- [ ] Subscription products
- [ ] Gift cards
- [ ] Loyalty program
- [ ] Affiliate system
- [ ] Live chat support

---

<div align="center">

### Made with ❤️ for Indian E-Commerce

**[View Demo](https://shopease.vercel.app)** • **[Report Bug](https://github.com/yourusername/shopease/issues)** • **[Request Feature](https://github.com/yourusername/shopease/issues)**

⭐ Star us on GitHub — it motivates us a lot!

</div>
