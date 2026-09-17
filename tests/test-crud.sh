#!/bin/bash

# Define base URL and Admin Token Cookie
BASE_URL="http://localhost:3001/api/admin/products"
COOKIE="marel_token=marel-local-admin-token"

echo "=== 1. Create a Product (POST) ==="
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d '{
    "name": "Test Curl Product",
    "category": "Test Kategori",
    "price": 10000,
    "stock": 50,
    "options": "{\"fabricColors\":[{\"id\":\"mavi\",\"name\":\"Mavi\",\"hex\":\"#0000FF\"}]}"
  }')

echo "$CREATE_RESPONSE"
PRODUCT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$PRODUCT_ID" ]; then
  echo "Failed to extract Product ID. Exiting."
  exit 1
fi

echo -e "\nCreated Product ID: $PRODUCT_ID"

echo -e "\n=== 2. Read Products (GET) ==="
curl -s -X GET "$BASE_URL" \
  -H "Cookie: $COOKIE" | grep -o '"name":"Test Curl Product"' || echo "Product not found in list."

echo -e "\n=== 3. Update Product (PATCH) ==="
curl -s -X PATCH "$BASE_URL/$PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d '{
    "name": "Test Curl Product Updated",
    "price": 12000
  }'

echo -e "\n\n=== 4. Delete Product (DELETE) ==="
curl -s -X DELETE "$BASE_URL/$PRODUCT_ID" \
  -H "Cookie: $COOKIE"

echo -e "\n\n=== CRUD Test Completed ==="
