# ShopEase API Documentation

Complete API documentation for ShopEase E-Commerce Platform.

## Base URL

- Development: `http://localhost:5173/api`
- Production: `https://your-domain.vercel.app/api`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format

### Success Response
```json
{
  "data": {},
  "message": "Success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "statusCode": 400
}
```

---

## Authentication Endpoints

### 1. Sign Up

Create a new user account.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - User already exists or invalid data
- `500` - Server error

---

### 2. Login

Authenticate existing user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**
- `200` - Login successful
- `401` - Invalid credentials
- `500` - Server error

---

## Product Endpoints

### 3. Get All Products

Retrieve products with filtering and pagination.

**Endpoint:** `GET /api/products`

**Query Parameters:**
- `category` (optional) - Filter by category (men, women, children)
- `search` (optional) - Search in name, description, category
- `sortBy` (optional) - Sort order: `price-asc`, `price-desc`, `name`
- `minPrice` (optional) - Minimum price in rupees
- `maxPrice` (optional) - Maximum price in rupees
- `limit` (optional) - Items per page (default: 50)
- `offset` (optional) - Skip items (default: 0)

**Example:**
```
GET /api/products?category=men&minPrice=1000&maxPrice=5000&limit=20
```

**Response:**
```json
{
  "products": [
    {
      "id": "silk-kurta-1",
      "name": "Royal Blue Silk Kurta",
      "description": "Elegant royal blue silk kurta...",
      "price": 2999,
      "basePrice": 3999,
      "category": "men",
      "subcategory": "Traditional Wear",
      "image": "/royal-blue-silk-kurta-for-men.png",
      "images": ["/royal-blue-silk-kurta-for-men.png", "..."],
      "sizes": ["S", "M", "L", "XL", "XXL"],
      "colors": ["Royal Blue", "Cream", "Golden"],
      "inStock": true,
      "stock": 45,
      "averageRating": 4.5,
      "reviewCount": 12
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### 4. Get Product Details

Get detailed information about a specific product.

**Endpoint:** `GET /api/products/[id]`

**Example:**
```
GET /api/products/silk-kurta-1
```

**Response:**
```json
{
  "id": "silk-kurta-1",
  "name": "Royal Blue Silk Kurta",
  "description": "Elegant royal blue silk kurta...",
  "price": 2999,
  "basePrice": 3999,
  "category": "men",
  "subcategory": "Traditional Wear",
  "image": "/royal-blue-silk-kurta-for-men.png",
  "images": ["/royal-blue-silk-kurta-for-men.png"],
  "sizes": ["S", "M", "L", "XL", "XXL"],
  "colors": ["Royal Blue", "Cream", "Golden", "Maroon"],
  "inStock": true,
  "stock": 45,
  "sku": "MEN-KURTA-001",
  "averageRating": 4.5,
  "reviewCount": 12,
  "reviews": [
    {
      "id": "review-1",
      "rating": 5,
      "comment": "Excellent quality!",
      "createdAt": "2024-01-15T10:30:00Z",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `404` - Product not found
- `500` - Server error

---

## Order Endpoints

### 5. Create Order

Create a new order. **Requires authentication.**

**Endpoint:** `POST /api/orders/create`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "silk-kurta-1",
      "quantity": 2,
      "size": "M",
      "color": "Royal Blue"
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "streetAddress": "123, MG Road",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "paymentMethod": "COD",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+91 98765 43210",
  "notes": "Please deliver in evening"
}
```

**Response:**
```json
{
  "id": "order-id",
  "orderNumber": "ORD-1704123456-ABC123",
  "status": "PENDING",
  "paymentMethod": "COD",
  "paymentStatus": "PENDING",
  "subtotal": 5998,
  "shipping": 0,
  "tax": 1079.64,
  "total": 7077.64,
  "items": [...],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Notes:**
- Free shipping for orders ≥ ₹500
- 18% GST automatically calculated
- Stock automatically updated
- Order tracking created automatically

**Status Codes:**
- `201` - Order created
- `400` - Invalid data or insufficient stock
- `401` - Unauthorized
- `404` - Product not found
- `500` - Server error

---

### 6. Get My Orders

Retrieve all orders for authenticated user.

**Endpoint:** `GET /api/orders/my-orders`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
[
  {
    "id": "order-id",
    "orderNumber": "ORD-1704123456-ABC123",
    "status": "SHIPPED",
    "total": 7077.64,
    "createdAt": "2024-01-15T10:30:00Z",
    "items": [
      {
        "product": {
          "name": "Royal Blue Silk Kurta",
          "image": "/royal-blue-silk-kurta-for-men.png"
        },
        "quantity": 2,
        "price": 2999
      }
    ],
    "tracking": {
      "status": "SHIPPED",
      "currentStep": 2,
      "estimatedDelivery": "2024-01-22T00:00:00Z",
      "trackingSteps": [
        {
          "step": "Order Placed",
          "description": "Your order has been received",
          "timestamp": "2024-01-15T10:30:00Z",
          "isCompleted": true
        }
      ]
    }
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

### 7. Track Order

Track order status by order number. **No authentication required.**

**Endpoint:** `GET /api/orders/track`

**Query Parameters:**
- `orderNumber` (required) - The order number

**Example:**
```
GET /api/orders/track?orderNumber=ORD-1704123456-ABC123
```

**Response:**
```json
{
  "id": "order-id",
  "orderNumber": "ORD-1704123456-ABC123",
  "status": "SHIPPED",
  "customerName": "John Doe",
  "total": 7077.64,
  "createdAt": "2024-01-15T10:30:00Z",
  "tracking": {
    "status": "SHIPPED",
    "currentStep": 2,
    "estimatedDelivery": "2024-01-22T00:00:00Z",
    "trackingSteps": [
      {
        "step": "Order Placed",
        "description": "Your order has been received and is being processed",
        "timestamp": "2024-01-15T10:30:00Z",
        "isCompleted": true
      },
      {
        "step": "Order Confirmed",
        "description": "Your order has been confirmed",
        "timestamp": "2024-01-16T09:00:00Z",
        "isCompleted": true
      },
      {
        "step": "Shipped",
        "description": "Your order is on the way",
        "timestamp": "2024-01-17T14:30:00Z",
        "isCompleted": true
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Order number required
- `404` - Order not found
- `500` - Server error

---

## User Endpoints

### 8. Get User Profile

Get authenticated user's profile.

**Endpoint:** `GET /api/users/profile`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "id": "user-id",
  "email": "john@example.com",
  "name": "John Doe",
  "phone": "+91 98765 43210",
  "isVerified": true,
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00Z",
  "addresses": [
    {
      "id": "addr-1",
      "type": "shipping",
      "firstName": "John",
      "lastName": "Doe",
      "streetAddress": "123, MG Road",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India",
      "phone": "+91 98765 43210",
      "isDefault": true
    }
  ],
  "_count": {
    "orders": 5,
    "favorites": 12,
    "reviews": 3
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

### 9. Update User Profile

Update authenticated user's profile information.

**Endpoint:** `PUT /api/users/profile`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+91 98765 43211"
}
```

**Response:**
```json
{
  "id": "user-id",
  "email": "john@example.com",
  "name": "John Smith",
  "phone": "+91 98765 43211",
  "isVerified": true,
  "role": "USER"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Rate Limit:** 100 requests per minute per IP
- **Headers:**
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## Pagination

For endpoints that support pagination:

```
GET /api/products?limit=20&offset=40
```

Response includes:
```json
{
  "data": [...],
  "total": 150,
  "limit": 20,
  "offset": 40
}
```

---

## Testing

### Test Credentials
```
Email: demo@shopease.in
Password: demo123
```

### Example cURL Commands

**Login:**
```bash
curl -X POST https://your-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@shopease.in","password":"demo123"}'
```

**Get Products:**
```bash
curl https://your-domain.vercel.app/api/products?category=men&limit=10
```

**Create Order:**
```bash
curl -X POST https://your-domain.vercel.app/api/orders/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"items":[{"productId":"silk-kurta-1","quantity":1}],...}'
```

---

## Need Help?

- GitHub Issues: [Link to repo]
- Email: support@shopease.in
- Documentation: [Link to docs]
