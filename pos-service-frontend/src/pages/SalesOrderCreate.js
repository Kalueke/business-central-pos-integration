import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Search, 
  User, 
  Package,
  Calculator,
  Save
} from 'lucide-react';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
import { createSalesOrder, getProducts, getCustomers } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const SalesOrderCreate = () => {
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      currencyCode: 'USD',
      paymentMethod: 'credit_card',
      paymentTerms: 'NET30',
      shipmentMethod: 'standard',
      taxRate: 0.1, // 10% tax rate
    }
  });

  // Fetch products and customers
  const { data: productsData, isLoading: productsLoading } = useQuery(
    ['products', searchTerm],
    () => getProducts({ search: searchTerm }),
    { enabled: !!searchTerm }
  );

  const { data: customersData, isLoading: customersLoading } = useQuery(
    'customers',
    () => getCustomers()
  );

  // Create sales order mutation
  const createOrderMutation = useMutation(createSalesOrder, {
    onSuccess: (data) => {
      toast.success('Sales order created successfully!');
      navigate(`/sales-orders/${data.data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create sales order');
    }
  });

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, item) => sum + item.lineTotal, 0);
    const taxRate = watch('taxRate') || 0.1;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    setValue('subtotal', subtotal);
    setValue('taxAmount', taxAmount);
    setValue('totalAmount', totalAmount);

    return { subtotal, taxAmount, totalAmount };
  };

  // Update totals when products change
  useEffect(() => {
    calculateTotals();
  }, [selectedProducts, watch('taxRate')]);

  // Add product to order
  const addProduct = (product) => {
    const existingProduct = selectedProducts.find(p => p.productId === product.id);
    
    if (existingProduct) {
      setSelectedProducts(prev => prev.map(p => 
        p.productId === product.id 
          ? { ...p, quantity: p.quantity + 1, lineTotal: (p.quantity + 1) * p.unitPrice }
          : p
      ));
    } else {
      const newProduct = {
        productId: product.id,
        productName: product.displayName || product.number,
        quantity: 1,
        unitPrice: product.unitPrice || 0,
        lineTotal: product.unitPrice || 0,
        description: product.description || '',
        sku: product.number || '',
      };
      setSelectedProducts(prev => [...prev, newProduct]);
    }
  };

  // Update product quantity
  const updateProductQuantity = (productId, quantity) => {
    setSelectedProducts(prev => prev.map(p => 
      p.productId === productId 
        ? { ...p, quantity: quantity, lineTotal: quantity * p.unitPrice }
        : p
    ));
  };

  // Remove product from order
  const removeProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  };

  // Handle form submission
  const onSubmit = (data) => {
    if (selectedProducts.length === 0) {
      toast.error('Please add at least one product to the order');
      return;
    }

    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    const orderData = {
      ...data,
      customerId: selectedCustomer.value,
      customerName: selectedCustomer.label,
      items: selectedProducts,
      subtotal: data.subtotal,
      taxAmount: data.taxAmount,
      totalAmount: data.totalAmount,
    };

    createOrderMutation.mutate(orderData);
  };

  const { subtotal, taxAmount, totalAmount } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/sales-orders')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Sales Order</h1>
            <p className="text-gray-600">Create a new sales order and send to Business Central</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Order Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Customer *
                    </label>
                    <Select
                      options={customersData?.data?.map(customer => ({
                        value: customer.number || customer.id,
                        label: customer.displayName || customer.name,
                        customer
                      })) || []}
                      value={selectedCustomer}
                      onChange={setSelectedCustomer}
                      placeholder="Search and select customer..."
                      isLoading={customersLoading}
                      isClearable
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Selection */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Products
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {/* Product Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Products
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  {/* Product Results */}
                  {searchTerm && (
                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                      {productsLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading products...</div>
                      ) : productsData?.data?.length > 0 ? (
                        <div className="divide-y">
                          {productsData.data.map((product) => (
                            <div
                              key={product.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                              onClick={() => addProduct(product)}
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {product.displayName || product.number}
                                </p>
                                <p className="text-sm text-gray-500">
                                  SKU: {product.number} • {formatCurrency(product.unitPrice || 0)}
                                </p>
                              </div>
                              <Plus className="h-4 w-4 text-primary-600" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">No products found</div>
                      )}
                    </div>
                  )}

                  {/* Selected Products */}
                  {selectedProducts.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Selected Products</h4>
                      <div className="space-y-2">
                        {selectedProducts.map((product) => (
                          <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{product.productName}</p>
                              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <label className="text-sm text-gray-600">Qty:</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={product.quantity}
                                  onChange={(e) => updateProductQuantity(product.productId, parseInt(e.target.value) || 1)}
                                  className="w-16 px-2 py-1 text-sm border rounded"
                                />
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  {formatCurrency(product.lineTotal)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatCurrency(product.unitPrice)} each
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeProduct(product.productId)}
                                className="p-1 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select {...register('paymentMethod')} className="input">
                      <option value="credit_card">Credit Card</option>
                      <option value="cash">Cash</option>
                      <option value="check">Check</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Terms
                    </label>
                    <select {...register('paymentTerms')} className="input">
                      <option value="NET30">Net 30</option>
                      <option value="NET15">Net 15</option>
                      <option value="NET60">Net 60</option>
                      <option value="IMMEDIATE">Immediate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipment Method
                    </label>
                    <select {...register('shipmentMethod')} className="input">
                      <option value="standard">Standard</option>
                      <option value="express">Express</option>
                      <option value="overnight">Overnight</option>
                      <option value="pickup">Pickup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select {...register('currencyCode')} className="input">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (C$)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="input"
                    placeholder="Additional notes for this order..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Order Summary
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {/* Tax Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate (%)
                    </label>
                    <Controller
                      name="taxRate"
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          {...field}
                          value={field.value * 100}
                          onValueChange={(values) => {
                            field.onChange(parseFloat(values.value) / 100);
                          }}
                          suffix="%"
                          decimalScale={2}
                          className="input"
                        />
                      )}
                    />
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>

                  {/* Hidden fields for form submission */}
                  <input type="hidden" {...register('subtotal')} value={subtotal} />
                  <input type="hidden" {...register('taxAmount')} value={taxAmount} />
                  <input type="hidden" {...register('totalAmount')} value={totalAmount} />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={createOrderMutation.isLoading || selectedProducts.length === 0 || !selectedCustomer}
                    className="btn btn-primary btn-lg w-full flex items-center justify-center"
                  >
                    {createOrderMutation.isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Create Order
                      </>
                    )}
                  </button>

                  {createOrderMutation.isLoading && (
                    <p className="text-sm text-gray-500 text-center">
                      Creating order and sending to Business Central...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SalesOrderCreate; 