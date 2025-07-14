# POS Service Backend

A Node.js/Express backend API for managing sales orders with Business Central integration.

## Features

- **Sales Order Management**: Create, read, update, and delete sales orders
- **Business Central Integration**: Seamless integration with Microsoft Business Central
- **Product Catalog**: Access products from Business Central
- **Customer Management**: Retrieve customer information from Business Central
- **Data Validation**: Comprehensive input validation using Joi
- **Error Handling**: Robust error handling and logging
- **Security**: Rate limiting, CORS, and security headers
- **Monitoring**: Health check endpoints and detailed logging

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Business Central environment with API access
- Azure App Registration for Business Central authentication

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd pos-service-backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file and configure it:
```bash
cp env.example .env
```

4. Update the `.env` file with your Business Central credentials:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Business Central API Configuration
BC_BASE_URL=https://api.businesscentral.dynamics.com/v2.0
BC_TENANT_ID=your-tenant-id
BC_CLIENT_ID=your-client-id
BC_CLIENT_SECRET=your-client-secret
BC_COMPANY_ID=your-company-id

# API Configuration
API_VERSION=v1
API_PREFIX=/api

# Security
JWT_SECRET=your-jwt-secret-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## API Endpoints

### Base URL
```
http://localhost:3001/api/v1
```

### Health Check
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system information

### Sales Orders
- `POST /sales-orders` - Create a new sales order
- `GET /sales-orders` - Get all sales orders (with pagination and filtering)
- `GET /sales-orders/:id` - Get a specific sales order
- `PUT /sales-orders/:id` - Update a sales order
- `PATCH /sales-orders/:id` - Partially update a sales order
- `DELETE /sales-orders/:id` - Delete a sales order
- `GET /sales-orders/stats` - Get sales order statistics
- `GET /sales-orders/bc-test` - Test Business Central connection

### Products
- `GET /products` - Get products from Business Central
- `GET /products/:id` - Get a specific product
- `GET /products/search/:term` - Search products

### Customers
- `GET /customers` - Get customers from Business Central
- `GET /customers/:id` - Get a specific customer
- `GET /customers/search/:term` - Search customers

## API Usage Examples

### Create a Sales Order

```bash
curl -X POST http://localhost:3001/api/v1/sales-orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "C001",
    "customerName": "John Doe",
    "customerAddress": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "postalCode": "12345"
    },
    "items": [
      {
        "productId": "P001",
        "productName": "Product 1",
        "quantity": 2,
        "unitPrice": 25.00,
        "lineTotal": 50.00
      }
    ],
    "subtotal": 50.00,
    "taxAmount": 5.00,
    "totalAmount": 55.00,
    "currencyCode": "USD"
  }'
```

### Get Sales Orders with Filtering

```bash
curl "http://localhost:3001/api/v1/sales-orders?status=pending&page=1&limit=10&sortBy=orderDate&sortOrder=desc"
```

### Get Products from Business Central

```bash
curl "http://localhost:3001/api/v1/products?search=laptop"
```

### Test Business Central Connection

```bash
curl http://localhost:3001/api/v1/sales-orders/bc-test
```

## Data Models

### Sales Order
```javascript
{
  id: "uuid",
  orderNumber: "SO-1234567890-1",
  customerId: "C001",
  customerName: "John Doe",
  customerAddress: {
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
    country: "US",
    postalCode: "12345"
  },
  items: [
    {
      productId: "P001",
      productName: "Product 1",
      quantity: 2,
      unitPrice: 25.00,
      lineTotal: 50.00,
      description: "Product description"
    }
  ],
  subtotal: 50.00,
  taxAmount: 5.00,
  totalAmount: 55.00,
  currencyCode: "USD",
  paymentMethod: "credit_card",
  paymentTerms: "NET30",
  shipmentMethod: "standard",
  orderDate: "2024-01-15T10:30:00Z",
  notes: "Order notes",
  status: "pending",
  bcOrderId: "bc-order-id",
  bcStatus: "processing",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

## Business Central Integration

The service integrates with Business Central using OAuth 2.0 client credentials flow. It automatically:

1. **Authenticates** with Business Central using your app registration
2. **Transforms** POS data to Business Central format
3. **Sends** sales orders to Business Central
4. **Retrieves** products and customer data from Business Central
5. **Handles** errors and retries gracefully

### Required Business Central Setup

1. Create an Azure App Registration
2. Grant API permissions for Business Central
3. Create a client secret
4. Configure the app registration in Business Central

## Error Handling

The API returns consistent error responses:

```javascript
{
  "success": false,
  "error": "Error message",
  "details": ["Detailed error messages"] // For validation errors
}
```

## Logging

The application uses Winston for structured logging. Logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (error logs only)

## Security Features

- **Rate Limiting**: Configurable rate limiting per IP
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Input Validation**: Comprehensive validation using Joi
- **Error Sanitization**: Sensitive data is not exposed in error messages

## Development

### Project Structure
```
src/
├── controllers/          # Request handlers
├── middleware/           # Express middleware
├── routes/              # API routes
├── services/            # Business logic
├── utils/               # Utility functions
├── validation/          # Input validation schemas
└── server.js            # Main application file
```

### Adding New Features

1. Create validation schemas in `validation/`
2. Add business logic in `services/`
3. Create controllers in `controllers/`
4. Define routes in `routes/`
5. Update the main server file

## Testing

```bash
npm test
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure proper environment variables
3. Use a process manager like PM2
4. Set up reverse proxy (nginx)
5. Configure SSL certificates
6. Set up monitoring and alerting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License 