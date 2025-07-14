import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, 
  Edit, 
  Printer, 
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  Package,
  MapPin
} from 'lucide-react';
import { getSalesOrderById } from '../services/api';
import { formatCurrency, formatDate, formatOrderNumber } from '../utils/formatters';

const SalesOrderDetail = () => {
  const { id } = useParams();
  
  const { data: orderData, isLoading, error } = useQuery(
    ['sales-order', id],
    () => getSalesOrderById(id)
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-warning-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-secondary-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <AlertCircle className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading order</h3>
        <p className="text-gray-500 mb-4">{error.message}</p>
        <Link to="/sales-orders" className="btn btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  const order = orderData?.data;

  if (!order) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
        <Link to="/sales-orders" className="btn btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/sales-orders"
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {formatOrderNumber(order.orderNumber)}
            </h1>
            <p className="text-gray-600">Order Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn btn-secondary btn-sm">
            <Printer className="h-4 w-4 mr-1" />
            Print
          </button>
          <button className="btn btn-secondary btn-sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
          <button className="btn btn-primary btn-sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Order Status</h3>
            </div>
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status</p>
                    <span className={getStatusBadge(order.status)}>
                      {order.status}
                    </span>
                  </div>
                </div>
                {order.bcStatus && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Business Central</p>
                    <span className={getStatusBadge(order.bcStatus)}>
                      {order.bcStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
            </div>
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.productName}
                              </div>
                              {item.description && (
                                <div className="text-sm text-gray-500">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Notes</h3>
              </div>
              <div className="card-body">
                <p className="text-gray-700">{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                  <p className="text-sm text-gray-500">ID: {order.customerId}</p>
                </div>
                {order.customerAddress && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      {order.customerAddress.street && <p>{order.customerAddress.street}</p>}
                      {order.customerAddress.city && order.customerAddress.state && (
                        <p>{order.customerAddress.city}, {order.customerAddress.state}</p>
                      )}
                      {order.customerAddress.postalCode && <p>{order.customerAddress.postalCode}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Order Summary
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium">{formatDate(order.orderDate)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Payment Terms:</span>
                  <span className="font-medium">{order.paymentTerms}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Shipment Method:</span>
                  <span className="font-medium">{order.shipmentMethod}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-medium">{order.currencyCode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Financial Summary</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold border-t pt-3">
                  <span>Total:</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Timestamps
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Updated:</span>
                  <span className="font-medium">{formatDate(order.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderDetail; 