import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Package,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getSalesOrderStats, getSalesOrders } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery('sales-stats', getSalesOrderStats);
  const { data: recentOrders, isLoading: ordersLoading } = useQuery(
    'recent-orders',
    () => getSalesOrders({ limit: 5, sortBy: 'orderDate', sortOrder: 'desc' })
  );

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">
              {statsLoading ? '...' : value}
            </p>
            {change && (
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {change}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-warning-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-secondary-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "badge";
    switch (status) {
      case 'completed':
        return `${baseClasses} badge-success`;
      case 'processing':
        return `${baseClasses} badge-warning`;
      case 'pending':
        return `${baseClasses} badge-secondary`;
      default:
        return `${baseClasses} badge-secondary`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your sales and orders</p>
        </div>
        <Link to="/sales-orders/create" className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Sales Order
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats?.data?.totalOrders || 0}
          icon={ShoppingCart}
          color="bg-primary-500"
          change="+12% from last month"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.data?.revenue?.total || 0)}
          icon={DollarSign}
          color="bg-success-500"
          change="+8% from last month"
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(stats?.data?.revenue?.average || 0)}
          icon={TrendingUp}
          color="bg-warning-500"
        />
        <StatCard
          title="Products Available"
          value="1,234"
          icon={Package}
          color="bg-secondary-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          </div>
          <div className="card-body">
            {ordersLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : recentOrders?.data?.orders?.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.data.orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-500">{order.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={getStatusBadge(order.status)}>
                        {order.status}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
                <Link
                  to="/sales-orders"
                  className="flex items-center justify-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all orders
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders yet</p>
                <Link to="/sales-orders/create" className="btn btn-primary btn-sm mt-2">
                  Create your first order
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <Link
                to="/sales-orders/create"
                className="flex items-center p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-primary-900">Create New Order</p>
                  <p className="text-xs text-primary-600">Start a new sales order</p>
                </div>
              </Link>
              
              <Link
                to="/products"
                className="flex items-center p-3 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <Package className="h-5 w-5 text-secondary-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Browse Products</p>
                  <p className="text-xs text-secondary-600">View product catalog</p>
                </div>
              </Link>
              
              <Link
                to="/customers"
                className="flex items-center p-3 bg-success-50 hover:bg-success-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="h-5 w-5 text-success-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-success-900">Manage Customers</p>
                  <p className="text-xs text-success-600">View customer information</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      {stats?.data?.statusBreakdown && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Order Status Overview</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-600">
                  {stats.data.statusBreakdown.pending}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-600">
                  {stats.data.statusBreakdown.processing}
                </div>
                <div className="text-sm text-gray-600">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">
                  {stats.data.statusBreakdown.completed}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-danger-600">
                  {stats.data.statusBreakdown.cancelled}
                </div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 