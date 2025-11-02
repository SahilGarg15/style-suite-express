# Style Suite Express - AI Integration API

## Authentication

All API v1 endpoints require an API key for authentication. Include the API key in the `x-api-key` header of your requests.

```
x-api-key: YOUR_API_KEY_HERE
```

---

## API Endpoints

### Base URL

- **Development**: `http://localhost:8080/api/v1`
- **Production**: `https://style-suite-express.vercel.app/api/v1`

**Note**: The v1 API uses a single consolidated endpoint with an `action` parameter to specify products or orders.

---

## 1. Fetch Products

Get a list of products or a single product by ID.

### Endpoint
```
GET /api/v1/products
```

### Headers
```
x-api-key: YOUR_API_KEY
```

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | string | Get single product by ID | `?id=123` |
| `category` | string | Filter by category | `?category=Men` |
| `subcategory` | string | Filter by subcategory | `?subcategory=Shirts` |
| `search` | string | Search in name/description | `?search=cotton` |
| `minPrice` | number | Minimum price filter | `?minPrice=500` |
| `maxPrice` | number | Maximum price filter | `?maxPrice=2000` |
| `limit` | number | Number of products (default: 20) | `?limit=10` |
| `offset` | number | Pagination offset (default: 0) | `?offset=20` |

### Example Request (cURL)

```bash
# Get all products
curl -X GET "https://style-suite-express.vercel.app/api/v1/products" \
  -H "x-api-key: YOUR API KEY"

# Get single product
curl -X GET "https://style-suite-express.vercel.app/api/v1/products?id=cm47ngjsv0000147khwwh1ukn" \
  -H "x-api-key: YOUR_API_KEY"

# Filter by category
curl -X GET "https://style-suite-express.vercel.app/api/v1/products?category=Men&limit=10" \
  -H "x-api-key: YOUR_API_KEY"
```

### Example Request (Python)

```python
import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://style-suite-express.vercel.app/api/v1"

headers = {
    "x-api-key": API_KEY
}

# Get all products
response = requests.get(f"{BASE_URL}/products", headers=headers)
products = response.json()

# Get single product
response = requests.get(f"{BASE_URL}/products?id=PRODUCT_ID", headers=headers)
product = response.json()

# Filter products
response = requests.get(
    f"{BASE_URL}/products?category=Women&minPrice=500&maxPrice=2000&limit=10",
    headers=headers
)
filtered_products = response.json()
```

### Example Response (List)

```json
{
  "products": [
    {
      "id": "cm47ngjsv0000147khwwh1ukn",
      "name": "Classic White T-Shirt",
      "description": "Essential white cotton t-shirt",
      "price": 599,
      "category": "Men",
      "subcategory": "T-Shirts",
      "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      "stock": 50,
      "reviewCount": 5,
      "averageRating": 4.5,
      "isActive": true,
      "createdAt": "2024-11-01T10:00:00.000Z"
    }
  ],
  "total": 39,
  "limit": 20,
  "offset": 0
}
```

### Example Response (Single Product)

```json
{
  "id": "cm47ngjsv0000147khwwh1ukn",
  "name": "Classic White T-Shirt",
  "description": "Essential white cotton t-shirt",
  "price": 599,
  "category": "Men",
  "subcategory": "T-Shirts",
  "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  "stock": 50,
  "reviewCount": 5,
  "averageRating": 4.5,
  "isActive": true,
  "createdAt": "2024-11-01T10:00:00.000Z"
}
```

---

## 2. Place Order

Create a new order for products.

### Endpoint
```
POST /api/v1/orders
```

### Headers
```
x-api-key: YOUR_API_KEY
Content-Type: application/json
```

### Request Body

```json
{
  "userId": "optional-user-id",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "customerPhone": "+91-9876543210",
  "items": [
    {
      "productId": "cm47ngjsv0000147khwwh1ukn",
      "quantity": 2,
      "price": 599
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "phone": "+91-9876543210",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "paymentMethod": "COD"
}
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | No | Existing user ID (if available) |
| `customerEmail` | string | Yes | Customer email address |
| `customerName` | string | No | Customer name (defaults to "Guest") |
| `customerPhone` | string | No | Customer phone number |
| `items` | array | Yes | Array of order items |
| `items[].productId` | string | Yes | Product ID to order |
| `items[].quantity` | number | Yes | Quantity to order |
| `items[].price` | number | Yes | Price per unit |
| `shippingAddress` | object | Yes | Shipping address details |
| `paymentMethod` | string | Yes | Payment method: "COD", "CARD", "UPI", "NET_BANKING", "WALLET" |

### Example Request (cURL)

```bash
curl -X POST "https://style-suite-express.vercel.app/api/v1/orders" \
  -H "x-api-key: 37d07e0a2a290644cf9c3e731462128e741abda974c3ae882367c483893b521a" \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "ai@example.com",
    "customerName": "AI Assistant",
    "customerPhone": "+91-9876543210",
    "items": [
      {
        "productId": "cm47ngjsv0000147khwwh1ukn",
        "quantity": 2,
        "price": 599
      }
    ],
    "shippingAddress": {
      "name": "AI Assistant",
      "phone": "+91-9876543210",
      "addressLine1": "123 Tech Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "paymentMethod": "COD"
  }'
```

### Example Request (Python)

```python
import requests

API_KEY = "37d07e0a2a290644cf9c3e731462128e741abda974c3ae882367c483893b521a"
BASE_URL = "https://style-suite-express.vercel.app/api/v1"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

order_data = {
    "customerEmail": "ai@example.com",
    "customerName": "AI Assistant",
    "customerPhone": "+91-9876543210",
    "items": [
        {
            "productId": "cm47ngjsv0000147khwwh1ukn",
            "quantity": 2,
            "price": 599
        }
    ],
    "shippingAddress": {
        "name": "AI Assistant",
        "phone": "+91-9876543210",
        "addressLine1": "123 Tech Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "country": "India"
    },
    "paymentMethod": "COD"
}

response = requests.post(
    f"{BASE_URL}/orders",
    headers=headers,
    json=order_data
)

order = response.json()
print(f"Order created: {order['order']['orderNumber']}")
```

### Example Response

```json
{
  "success": true,
  "order": {
    "id": "cm48abc123456789",
    "orderNumber": "ORD-1730535626000",
    "total": 1198,
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "createdAt": "2024-11-02T06:33:46.000Z",
    "items": [
      {
        "id": "cm48item123",
        "quantity": 2,
        "price": 599,
        "product": {
          "id": "cm47ngjsv0000147khwwh1ukn",
          "name": "Classic White T-Shirt",
          "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
        }
      }
    ]
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Invalid API key"
}
```

### 400 Bad Request
```json
{
  "error": "Missing required fields: items, shippingAddress"
}
```

### 404 Not Found
```json
{
  "error": "Product not found"
}
```

### 409 Conflict
```json
{
  "error": "Insufficient stock for product: Classic White T-Shirt"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Usage Tips for AI

1. **Fetch Products First**: Always fetch product details to get current prices and stock availability before placing orders.

2. **Validate Stock**: Check the `stock` field to ensure products are available before ordering.

3. **Handle Guest Orders**: If you don't have a userId, the system will create a guest user with the provided email.

4. **Calculate Total**: The total is calculated automatically based on item quantities and prices.

5. **Payment Methods**: COD is the safest option for AI-placed orders. Other methods require payment gateway integration.

6. **Error Handling**: Always check for error responses and handle them appropriately in your AI logic.

7. **Rate Limiting**: Be considerate with API usage. The API key tracks usage via the `lastUsed` timestamp.

---

## Example AI Workflow

```python
import requests

API_KEY = "37d07e0a2a290644cf9c3e731462128e741abda974c3ae882367c483893b521a"
BASE_URL = "https://style-suite-express.vercel.app/api/v1"

def fetch_products(category=None, search=None):
    """Fetch products from the store"""
    headers = {"x-api-key": API_KEY}
    params = {}
    if category:
        params['category'] = category
    if search:
        params['search'] = search
    
    response = requests.get(f"{BASE_URL}/products", headers=headers, params=params)
    return response.json()

def place_order(customer_email, items, shipping_address):
    """Place an order"""
    headers = {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
    }
    
    order_data = {
        "customerEmail": customer_email,
        "items": items,
        "shippingAddress": shipping_address,
        "paymentMethod": "COD"
    }
    
    response = requests.post(f"{BASE_URL}/orders", headers=headers, json=order_data)
    return response.json()

# Example usage
# Step 1: Search for products
products = fetch_products(category="Men", search="shirt")
print(f"Found {len(products['products'])} products")

# Step 2: Select a product and check stock
product = products['products'][0]
if product['stock'] > 0:
    # Step 3: Place order
    order = place_order(
        customer_email="ai@example.com",
        items=[{
            "productId": product['id'],
            "quantity": 1,
            "price": product['price']
        }],
        shipping_address={
            "name": "AI Customer",
            "phone": "+91-9876543210",
            "addressLine1": "123 Street",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001",
            "country": "India"
        }
    )
    print(f"Order placed: {order['order']['orderNumber']}")
```

---

## Support

For issues or questions, please contact the development team or check the main application at:
https://style-suite-express.vercel.app
