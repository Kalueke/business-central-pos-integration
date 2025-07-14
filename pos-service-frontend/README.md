# POS Service Frontend

A modern React-based frontend interface for the POS service with Business Central integration.

## Features

- **🎯 Modern UI/UX**: Clean, responsive design built with Tailwind CSS
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🛒 Sales Order Management**: Create, view, and manage sales orders
- **🔍 Product Catalog**: Browse and search products from Business Central
- **👥 Customer Management**: View customer information from Business Central
- **📊 Dashboard**: Real-time statistics and order overview
- **🔄 Real-time Updates**: Live data synchronization with backend
- **🎨 Beautiful Components**: Modern UI components with smooth animations
- **📱 Mobile-First**: Optimized for touch interfaces

## Tech Stack

- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing
- **React Query**: Server state management and caching
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **React Hook Form**: Form handling and validation
- **React Hot Toast**: Toast notifications
- **Axios**: HTTP client for API communication

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see backend README)

## Installation

1. Navigate to the frontend directory:
```bash
cd pos-service-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout/         # Layout components
├── pages/              # Page components
│   ├── Dashboard.js    # Main dashboard
│   ├── SalesOrderCreate.js  # Create new orders
│   ├── SalesOrderList.js    # List all orders
│   ├── SalesOrderDetail.js  # Order details
│   ├── Products.js     # Product catalog
│   ├── Customers.js    # Customer management
│   └── Settings.js     # System settings
├── services/           # API services
│   └── api.js         # API client and functions
├── utils/              # Utility functions
│   └── formatters.js   # Data formatting utilities
├── App.js              # Main application component
├── index.js            # Application entry point
└── index.css           # Global styles
```

## Key Features

### Dashboard
- **Overview Statistics**: Total orders, revenue, average order value
- **Recent Orders**: Latest orders with status indicators
- **Quick Actions**: Fast access to common tasks
- **Status Breakdown**: Visual representation of order statuses

### Sales Order Creation
- **Customer Selection**: Search and select customers from Business Central
- **Product Search**: Real-time product search and selection
- **Dynamic Pricing**: Automatic calculation of totals and tax
- **Order Details**: Payment methods, shipping, and notes
- **Business Central Integration**: Automatic sync with BC

### Sales Order Management
- **Advanced Filtering**: Filter by status, date range, customer
- **Sorting**: Sort by any column
- **Pagination**: Handle large datasets efficiently
- **Status Tracking**: Visual status indicators
- **BC Sync Status**: Monitor Business Central integration

### Product Catalog
- **Search Functionality**: Find products by name or SKU
- **Product Details**: View pricing and descriptions
- **Business Central Data**: Real-time product information

### Customer Management
- **Customer Search**: Find customers quickly
- **Contact Information**: View addresses, phone, email
- **Business Central Integration**: Sync customer data

## API Integration

The frontend communicates with the backend API through the `services/api.js` file. Key features:

- **Automatic Error Handling**: Consistent error messages
- **Request/Response Interceptors**: Global API configuration
- **React Query Integration**: Caching and background updates
- **Loading States**: User-friendly loading indicators

## Styling

The application uses Tailwind CSS with custom components:

- **Custom Components**: `.btn`, `.card`, `.input`, `.badge` classes
- **Color System**: Consistent color palette with semantic colors
- **Responsive Design**: Mobile-first approach
- **Animations**: Smooth transitions and hover effects

## Development

### Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

### Environment Variables

The frontend automatically proxies API requests to the backend. Make sure your backend is running on `http://localhost:3001`.

### Adding New Features

1. **Create Components**: Add reusable components in `src/components/`
2. **Add Pages**: Create new pages in `src/pages/`
3. **Update API**: Add new API functions in `src/services/api.js`
4. **Update Routing**: Add routes in `src/App.js`

## Deployment

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Environment Configuration

For production deployment, update the API base URL in `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api/v1',
  // ...
});
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License 