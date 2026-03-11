# Cart API Documentation

**Base URL:** `http://localhost:3000/api/cart` (development) or `/api/cart` (production)

**Authentication:** All endpoints require a valid JWT token in the `Authorization: Bearer <token>` header.

---

## Endpoints

### 1. Add Product to Cart

**Endpoint:** `POST /api/cart`

**Description:** Add a product to the user's shopping cart or increase its quantity if already present.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "product_id": 42,
  "quantity": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Product added to cart",
  "cart_item": {
    "id": 123,
    "cart_id": 5,
    "product_id": 42,
    "quantity": 1,
    "product": {
      "id": 42,
      "name": "Organic Milk",
      "price": 4.99,
      "image_url": "https://example.com/milk.jpg",
      "stock": 50
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing or invalid product_id/quantity
  ```json
  { "error": "Invalid product_id or quantity" }
  ```

- `401 Unauthorized`: Missing or invalid JWT token
  ```json
  { "error": "Unauthorized" }
  ```

- `404 Not Found`: Product does not exist
  ```json
  { "error": "Product not found" }
  ```

- `409 Conflict`: Product out of stock
  ```json
  { 
    "error": "Insufficient stock",
    "available": 10
  }
  ```

---

### 2. Get Shopping Cart

**Endpoint:** `GET /api/cart`

**Description:** Fetch the user's complete shopping cart with all items and calculated totals.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:** None

**Response (200 OK):**
```json
{
  "success": true,
  "cart": {
    "id": 5,
    "user_id": "uuid-123",
    "items": [
      {
        "id": 123,
        "product_id": 42,
        "quantity": 2,
        "product": {
          "id": 42,
          "name": "Organic Milk",
          "price": 4.99,
          "image_url": "https://example.com/milk.jpg",
          "stock": 50
        }
      },
      {
        "id": 124,
        "product_id": 99,
        "quantity": 1,
        "product": {
          "id": 99,
          "name": "Bread",
          "price": 2.50,
          "image_url": "https://example.com/bread.jpg",
          "stock": 100
        }
      }
    ],
    "totals": {
      "subtotal": 12.48,
      "tax": 1.25,
      "shipping": 5.00,
      "total": 18.73
    }
  }
}
```

**Empty Cart Response (200 OK):**
```json
{
  "success": true,
  "cart": {
    "id": null,
    "user_id": "uuid-123",
    "items": [],
    "totals": {
      "subtotal": 0,
      "tax": 0,
      "shipping": 0,
      "total": 0
    }
  }
}
```

**Error Response:**

- `401 Unauthorized`
  ```json
  { "error": "Unauthorized" }
  ```

---

### 3. Remove Product from Cart

**Endpoint:** `POST /api/cart/remove`

**Description:** Remove a product entirely from the user's cart. This operation is idempotent — removing a non-existent product returns success.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "product_id": 42
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product removed from cart",
  "cart_id": 5
}
```

**Error Response:**

- `401 Unauthorized`
  ```json
  { "error": "Unauthorized" }
  ```

---

### 4. Update Product Quantity

**Endpoint:** `PUT /api/cart/update-quantity`

**Description:** Update the quantity of a product in the user's cart. Setting quantity to 0 removes the item.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "product_id": 42,
  "quantity": 5
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Quantity updated",
  "cart_item": {
    "id": 123,
    "product_id": 42,
    "quantity": 5
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid quantity or missing fields
  ```json
  { "error": "Quantity must be a non-negative integer" }
  ```

- `401 Unauthorized`
  ```json
  { "error": "Unauthorized" }
  ```

- `404 Not Found`: Item not in cart or product does not exist
  ```json
  { "error": "Item not found in cart" }
  ```

- `409 Conflict`: Insufficient stock for requested quantity
  ```json
  {
    "error": "Insufficient stock",
    "available": 10,
    "requested": 20
  }
  ```

---

### 5. Clear Entire Cart

**Endpoint:** `DELETE /api/cart/clear`

**Description:** Remove all items from the user's cart. This operation is idempotent.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart cleared",
  "cart_id": 5
}
```

**Error Response:**

- `401 Unauthorized`
  ```json
  { "error": "Unauthorized" }
  ```

---

## Pricing Model

The Cart API automatically calculates the following:

- **Subtotal:** Sum of (product.price × quantity) for all items
- **Tax:** 10% of subtotal
- **Shipping:** $5.00 flat rate, or $0 if subtotal ≥ $50
- **Total:** subtotal + tax + shipping

---

## Authentication

All endpoints require a valid JWT token obtained from Supabase Auth. Include it in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The server validates the token and extracts the user ID to ensure users only access their own cart.

---

## Error Handling

All error responses include:

- **error:** A human-readable error message
- **message (optional):** Additional details for 5xx errors

**Status Codes:**
- `200 OK`: Successful request
- `201 Created`: Resource successfully created (add to cart)
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Resource not found
- `409 Conflict`: Business logic conflict (e.g., out of stock)
- `500 Internal Server Error`: Server error

---

## Examples

### Example 1: Add Product to Cart

```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 42,
    "quantity": 1
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Product added to cart",
  "cart_item": {
    "id": 123,
    "cart_id": 5,
    "product_id": 42,
    "quantity": 1,
    "product": {
      "id": 42,
      "name": "Organic Milk",
      "price": 4.99,
      "image_url": "https://example.com/milk.jpg",
      "stock": 50
    }
  }
}
```

### Example 2: Fetch Cart with Totals

```bash
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "cart": {
    "id": 5,
    "user_id": "uuid-123",
    "items": [
      {
        "id": 123,
        "product_id": 42,
        "quantity": 2,
        "product": {
          "id": 42,
          "name": "Organic Milk",
          "price": 4.99,
          "image_url": "https://example.com/milk.jpg",
          "stock": 50
        }
      }
    ],
    "totals": {
      "subtotal": 9.98,
      "tax": 1.00,
      "shipping": 5.00,
      "total": 15.98
    }
  }
}
```

### Example 3: Remove Product from Cart

```bash
curl -X POST http://localhost:3000/api/cart/remove \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 42
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Product removed from cart",
  "cart_id": 5
}
```

---

## Testing Tips

1. **Obtain a JWT token:** Use Supabase Auth to sign up or log in
2. **Store the token:** Extract `access_token` from the response
3. **Make requests:** Include `Authorization: Bearer <token>` in all requests
4. **Test with Postman:** Create a collection and set the token as an environment variable
5. **Unit tests:** See `CART_API.architecture.md` for testing plan

---

**Document Created:** 11 MAR 2026  
**API Version:** 1.0  
**Status:** ✅ Implementation Complete  
