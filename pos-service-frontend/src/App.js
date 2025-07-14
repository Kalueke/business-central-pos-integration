import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginForm from './components/Auth/LoginForm';

// Pages
import Dashboard from './pages/Dashboard';
import SalesOrderCreate from './pages/SalesOrderCreate';
import SalesOrderList from './pages/SalesOrderList';
import SalesOrderDetail from './pages/SalesOrderDetail';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/sales-orders" element={
              <ProtectedRoute requiredRoles={['cashier', 'admin']}>
                <Layout>
                  <SalesOrderList />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/sales-orders/create" element={
              <ProtectedRoute requiredRoles={['cashier', 'admin']}>
                <Layout>
                  <SalesOrderCreate />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/sales-orders/:id" element={
              <ProtectedRoute requiredRoles={['cashier', 'admin']}>
                <Layout>
                  <SalesOrderDetail />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/products" element={
              <ProtectedRoute requiredRoles={['cashier', 'admin']}>
                <Layout>
                  <Products />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/customers" element={
              <ProtectedRoute requiredRoles={['cashier', 'admin']}>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/users" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Redirect to dashboard for unknown routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 