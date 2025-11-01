# 🛍️ Style Suite Express

A modern, full-stack e-commerce platform for traditional Indian ethnic wear and western fashion. Built with React, TypeScript, and a complete backend API with PostgreSQL database.

![Style Suite Express](public/fashion-clothing-store-hero-banner.png)

## ✨ Features

### 🎯 Core Features
- **Product Catalog** - Browse 39+ curated products across Men, Women, and Children categories
- **User Authentication** - Secure JWT-based login/signup with role-based access control
- **Shopping Cart & Wishlist** - Add products to cart or save for later
- **Product Reviews** - Write and read customer reviews with star ratings
- **Order Management** - Place orders, track shipments, view order history
- **Search & Filter** - Find products by category, price range, and search terms
- **Responsive Design** - Seamless experience across desktop, tablet, and mobile

### 👨‍💼 Admin Dashboard
- **Product Management** - CRUD operations for products, stock management
- **Order Management** - View all orders, update order status and tracking
- **User Management** - View users, manage roles (USER/ADMIN)
- **Dashboard Stats** - Real-time analytics (revenue, orders, products, users)
- **Low Stock Alerts** - Monitor inventory levels

### 🔒 Security
- JWT authentication with secure token storage
- Role-based access control (USER/ADMIN)
- Protected admin routes
- User-specific data isolation
- Input validation and sanitization

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **React Router** - Client-side routing
- **Sonner** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Vercel Serverless Functions** - API endpoints
- **Prisma ORM** - Database management
- **PostgreSQL (Neon)** - Cloud database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Neon account)
- Git

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/SahilGarg15/style-suite-express.git
cd style-suite-express

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# 4. Set up the database
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Neon Database URLs
DATABASE_URL="postgresql://user:password@your-neon-endpoint.neon.tech/shopease?sslmode=require"
DIRECT_URL="postgresql://user:password@your-neon-endpoint.neon.tech/shopease?sslmode=require"

# JWT Secret (use a strong random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Node Environment
NODE_ENV="development"
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID

### Reviews
- `GET /api/reviews?productId={id}` - Get product reviews
- `POST /api/reviews` - Create review (auth required)
- `PUT /api/reviews` - Update review (auth required)
- `DELETE /api/reviews?reviewId={id}` - Delete review (auth required)

### Orders
- `POST /api/orders/create` - Create order (auth required)
- `GET /api/orders/my-orders` - Get user orders (auth required)
- `GET /api/orders/track?orderNumber={number}` - Track order

### Admin (requires ADMIN role)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/products` - Manage products
- `GET /api/admin/orders` - Manage orders
- `GET /api/admin/users` - Manage users

## 🎨 Demo Credentials

### Admin Account
- Email: `demo@example.com`
- Password: `demo123`
- Role: ADMIN

### Test User
Create your own account via signup page

## 📁 Project Structure

```
style-suite-express/
├── api/                    # Backend API endpoints
│   ├── auth/              # Authentication endpoints
│   ├── products/          # Product endpoints
│   ├── orders/            # Order endpoints
│   ├── reviews/           # Review endpoints
│   ├── admin/             # Admin endpoints
│   └── users/             # User profile endpoints
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Prisma schema
│   └── seed.ts            # Database seed data
├── src/
│   ├── components/        # React components
│   ├── contexts/          # React context providers
│   ├── pages/             # Page components
│   ├── lib/               # Utility functions and API client
│   └── types/             # TypeScript type definitions
├── public/                # Static assets and product images
└── vercel.json            # Vercel deployment config
```


## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Database commands
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema to database
npx prisma db seed   # Seed database with sample data
npx prisma studio    # Open Prisma Studio (GUI)
```

## 🎯 Key Features Implementation

### User Reviews System
- Star ratings (1-5 stars)
- Written reviews with comments
- Average rating calculation
- One review per user per product
- Edit/delete own reviews
- Public viewing for all users

### Admin Dashboard
- Real-time statistics
- Product CRUD operations
- Order status management
- User role management
- Low stock monitoring
- Search and filtering

### User Account Management
- User-specific profile data
- User-specific orders
- Isolated localStorage per user
- Secure password handling

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Sahil Garg**
- GitHub: [@SahilGarg15](https://github.com/SahilGarg15)
- Repository: [style-suite-express](https://github.com/SahilGarg15/style-suite-express)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email sahilgarg@example.com or open an issue in the GitHub repository.

---

Made with ❤️ by Sahil Garg
