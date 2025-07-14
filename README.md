# POS Service with Business Central Integration

A comprehensive Point of Sale (POS) system with authentication and user management that integrates with Microsoft Business Central for sales order processing.

## Features

### 🔐 Authentication & User Management
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (Admin, Manager, Cashier)
- **User registration and management** (Admin only)
- **Profile management** and password change functionality
- **Secure password hashing** with bcrypt
- **Token refresh** mechanism for seamless user experience

### 🛒 POS Functionality
- **Sales order creation** with product and customer selection
- **Real-time inventory** integration with Business Central
- **Customer management** and search
- **Order history** and detailed views
- **Dashboard** with sales statistics and recent orders

### 🔗 Business Central Integration
- **OAuth 2.0** client credentials flow
- **Automatic data synchronization** between POS and Business Central
- **Product catalog** sync from Business Central
- **Customer data** integration
- **Sales order submission** to Business Central

### 🎨 Modern UI/UX
- **Responsive design** with Tailwind CSS
- **Real-time notifications** with toast messages
- **Form validation** with Yup and React Hook Form
- **Loading states** and error handling
- **Mobile-friendly** interface

## Tech Stack

### Backend
- **Node.js** with Express.js
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Joi** for validation
- **Axios** for HTTP requests
- **Winston** for logging
- **Helmet** for security

### Frontend
- **React** with functional components and hooks
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** with Yup validation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Business Central environment (for full functionality)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd business-central-pos-integration
```

### 2. Backend Setup

```bash
cd pos-service-backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env file with your configuration
# See Environment Variables section below

# Start the development server
npm run dev
```

### 3. Frontend Setup

```bash
cd pos-service-frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Environment Variables

### Backend (.env)
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

# Security
JWT_SECRET=your-jwt-secret-key-make-it-long-and-secure
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# API Configuration
API_VERSION=v1
API_PREFIX=/api

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Default Users

The system comes with two default users for testing:

### Admin User
- **Username:** admin
- **Password:** admin123
- **Role:** admin
- **Permissions:** Full access to all features

### Cashier User
- **Username:** cashier
- **Password:** cashier123
- **Role:** cashier
- **Permissions:** Sales orders, products, customers

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration (Admin only)
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/change-password` - Change password

### User Management (Admin only)
- `GET /api/v1/auth/users` - Get all users
- `GET /api/v1/auth/users/:id` - Get user by ID
- `PUT /api/v1/auth/users/:id` - Update user
- `DELETE /api/v1/auth/users/:id` - Delete user

### Sales Orders
- `GET /api/v1/sales-orders` - Get all sales orders
- `POST /api/v1/sales-orders` - Create sales order
- `GET /api/v1/sales-orders/:id` - Get sales order by ID
- `PUT /api/v1/sales-orders/:id` - Update sales order
- `DELETE /api/v1/sales-orders/:id` - Delete sales order
- `GET /api/v1/sales-orders/stats` - Get sales statistics

### Products
- `GET /api/v1/products` - Get products from Business Central
- `GET /api/v1/products/:id` - Get product by ID
- `GET /api/v1/products/search/:term` - Search products

### Customers
- `GET /api/v1/customers` - Get customers from Business Central
- `GET /api/v1/customers/:id` - Get customer by ID
- `GET /api/v1/customers/search/:term` - Search customers

## User Roles and Permissions

### Admin
- Full access to all features
- User management (create, read, update, delete users)
- System settings and configuration
- Business Central connection testing
- Sales order management

### Manager
- Sales order management
- Product and customer access
- Basic reporting and statistics
- Profile management

### Cashier
- Create and view sales orders
- Access product catalog
- Search customers
- Basic profile management

## Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** using bcrypt with configurable rounds
- **Role-based Access Control** (RBAC)
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Helmet Security Headers** for additional protection
- **Input Validation** using Joi schemas
- **Error Handling** with proper HTTP status codes

## Development

### Backend Development
```bash
cd pos-service-backend

# Run in development mode with auto-reload
npm run dev

# Run tests
npm test

# Start production server
npm start
```

### Frontend Development
```bash
cd pos-service-frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Deployment

### Backend Deployment
1. Set up your production environment variables
2. Install dependencies: `npm install --production`
3. Start the server: `npm start`
4. Use a process manager like PM2 for production

### Frontend Deployment
1. Build the application: `npm run build`
2. Serve the `build` folder using a web server
3. Configure your reverse proxy to forward API requests to the backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

## Changelog

### v1.0.0
- Initial release with authentication and user management
- Business Central integration
- Complete POS functionality
- Role-based access control
- Modern React frontend with Tailwind CSS 