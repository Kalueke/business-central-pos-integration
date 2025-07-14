const Joi = require('joi');

// Validation schema for sales order items
const salesOrderItemSchema = Joi.object({
  productId: Joi.string().required().messages({
    'string.empty': 'Product ID is required',
    'any.required': 'Product ID is required'
  }),
  productName: Joi.string().required().messages({
    'string.empty': 'Product name is required',
    'any.required': 'Product name is required'
  }),
  quantity: Joi.number().positive().required().messages({
    'number.base': 'Quantity must be a number',
    'number.positive': 'Quantity must be positive',
    'any.required': 'Quantity is required'
  }),
  unitPrice: Joi.number().positive().required().messages({
    'number.base': 'Unit price must be a number',
    'number.positive': 'Unit price must be positive',
    'any.required': 'Unit price is required'
  }),
  lineTotal: Joi.number().positive().required().messages({
    'number.base': 'Line total must be a number',
    'number.positive': 'Line total must be positive',
    'any.required': 'Line total is required'
  }),
  description: Joi.string().optional().allow(''),
  sku: Joi.string().optional().allow(''),
  barcode: Joi.string().optional().allow('')
});

// Validation schema for customer address
const customerAddressSchema = Joi.object({
  street: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  postalCode: Joi.string().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow('')
});

// Validation schema for creating a sales order
const createSalesOrderSchema = Joi.object({
  orderNumber: Joi.string().required().messages({
    'string.empty': 'Order number is required',
    'any.required': 'Order number is required'
  }),
  customerId: Joi.string().required().messages({
    'string.empty': 'Customer ID is required',
    'any.required': 'Customer ID is required'
  }),
  customerName: Joi.string().required().messages({
    'string.empty': 'Customer name is required',
    'any.required': 'Customer name is required'
  }),
  customerAddress: customerAddressSchema.optional(),
  items: Joi.array().items(salesOrderItemSchema).min(1).required().messages({
    'array.min': 'At least one item is required',
    'any.required': 'Items are required'
  }),
  subtotal: Joi.number().positive().required().messages({
    'number.base': 'Subtotal must be a number',
    'number.positive': 'Subtotal must be positive',
    'any.required': 'Subtotal is required'
  }),
  taxAmount: Joi.number().min(0).required().messages({
    'number.base': 'Tax amount must be a number',
    'number.min': 'Tax amount cannot be negative',
    'any.required': 'Tax amount is required'
  }),
  totalAmount: Joi.number().positive().required().messages({
    'number.base': 'Total amount must be a number',
    'number.positive': 'Total amount must be positive',
    'any.required': 'Total amount is required'
  }),
  currencyCode: Joi.string().default('USD').optional(),
  paymentMethod: Joi.string().optional().allow(''),
  paymentTerms: Joi.string().optional().allow(''),
  shipmentMethod: Joi.string().optional().allow(''),
  orderDate: Joi.date().iso().optional(),
  notes: Joi.string().optional().allow(''),
  status: Joi.string().valid('pending', 'processing', 'completed', 'cancelled').default('pending').optional()
});

// Validation schema for updating a sales order
const updateSalesOrderSchema = Joi.object({
  customerId: Joi.string().optional(),
  customerName: Joi.string().optional(),
  customerAddress: customerAddressSchema.optional(),
  items: Joi.array().items(salesOrderItemSchema).min(1).optional(),
  subtotal: Joi.number().positive().optional(),
  taxAmount: Joi.number().min(0).optional(),
  totalAmount: Joi.number().positive().optional(),
  currencyCode: Joi.string().optional(),
  paymentMethod: Joi.string().optional().allow(''),
  paymentTerms: Joi.string().optional().allow(''),
  shipmentMethod: Joi.string().optional().allow(''),
  notes: Joi.string().optional().allow(''),
  status: Joi.string().valid('pending', 'processing', 'completed', 'cancelled').optional()
});

// Validation schema for query parameters
const salesOrderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).optional(),
  limit: Joi.number().integer().min(1).max(100).default(10).optional(),
  status: Joi.string().valid('pending', 'processing', 'completed', 'cancelled').optional(),
  customerId: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  sortBy: Joi.string().valid('orderDate', 'totalAmount', 'status', 'customerName').default('orderDate').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc').optional()
});

// Validation middleware
const validateSalesOrder = (req, res, next) => {
  const { error, value } = createSalesOrderSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
  }

  req.validatedData = value;
  next();
};

const validateSalesOrderUpdate = (req, res, next) => {
  const { error, value } = updateSalesOrderSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
  }

  req.validatedData = value;
  next();
};

const validateSalesOrderQuery = (req, res, next) => {
  const { error, value } = salesOrderQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
  }

  req.validatedQuery = value;
  next();
};

module.exports = {
  createSalesOrderSchema,
  updateSalesOrderSchema,
  salesOrderQuerySchema,
  validateSalesOrder,
  validateSalesOrderUpdate,
  validateSalesOrderQuery
}; 