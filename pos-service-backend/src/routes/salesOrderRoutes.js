const express = require('express');
const router = express.Router();
const salesOrderController = require('../controllers/salesOrderController');
const { 
  validateSalesOrder, 
  validateSalesOrderUpdate, 
  validateSalesOrderQuery 
} = require('../validation/salesOrderValidation');
const { authenticateToken, requireCashierOrAdmin } = require('../middleware/auth');

/**
 * @route   POST /api/v1/sales-orders
 * @desc    Create a new sales order
 * @access  Private (Cashier/Admin)
 */
router.post('/', authenticateToken, requireCashierOrAdmin, validateSalesOrder, salesOrderController.createSalesOrder);

/**
 * @route   GET /api/v1/sales-orders
 * @desc    Get all sales orders with pagination and filtering
 * @access  Private (Cashier/Admin)
 */
router.get('/', authenticateToken, requireCashierOrAdmin, validateSalesOrderQuery, salesOrderController.getSalesOrders);

/**
 * @route   GET /api/v1/sales-orders/stats
 * @desc    Get sales order statistics
 * @access  Private (Cashier/Admin)
 */
router.get('/stats', authenticateToken, requireCashierOrAdmin, salesOrderController.getSalesOrderStats);

/**
 * @route   GET /api/v1/sales-orders/bc-test
 * @desc    Test Business Central connection
 * @access  Private (Admin)
 */
router.get('/bc-test', authenticateToken, requireAdmin, salesOrderController.testBusinessCentralConnection);

/**
 * @route   GET /api/v1/sales-orders/:id
 * @desc    Get a specific sales order by ID
 * @access  Private (Cashier/Admin)
 */
router.get('/:id', authenticateToken, requireCashierOrAdmin, salesOrderController.getSalesOrderById);

/**
 * @route   PUT /api/v1/sales-orders/:id
 * @desc    Update a sales order
 * @access  Private (Cashier/Admin)
 */
router.put('/:id', authenticateToken, requireCashierOrAdmin, validateSalesOrderUpdate, salesOrderController.updateSalesOrder);

/**
 * @route   PATCH /api/v1/sales-orders/:id
 * @desc    Partially update a sales order
 * @access  Private (Cashier/Admin)
 */
router.patch('/:id', authenticateToken, requireCashierOrAdmin, validateSalesOrderUpdate, salesOrderController.updateSalesOrder);

/**
 * @route   DELETE /api/v1/sales-orders/:id
 * @desc    Delete a sales order
 * @access  Private (Admin)
 */
router.delete('/:id', authenticateToken, requireAdmin, salesOrderController.deleteSalesOrder);

module.exports = router; 