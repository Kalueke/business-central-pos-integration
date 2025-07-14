const express = require('express');
const router = express.Router();
const businessCentralService = require('../services/businessCentralService');
const logger = require('../utils/logger');
const { authenticateToken, requireCashierOrAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/v1/customers
 * @desc    Get customers from Business Central
 * @access  Private (Cashier/Admin)
 */
router.get('/', authenticateToken, requireCashierOrAdmin, async (req, res) => {
  try {
    const { filter, search } = req.query;
    let bcFilter = filter || '';
    
    // Add search filter if provided
    if (search) {
      const searchFilter = `contains(displayName,'${search}') or contains(number,'${search}')`;
      bcFilter = bcFilter ? `${bcFilter} and (${searchFilter})` : searchFilter;
    }

    const customers = await businessCentralService.getCustomers(bcFilter);
    
    res.status(200).json({
      success: true,
      data: customers,
      count: customers.length
    });
  } catch (error) {
    logger.error('Error getting customers:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get customers',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/customers/:id
 * @desc    Get a specific customer by ID
 * @access  Private (Cashier/Admin)
 */
router.get('/:id', authenticateToken, requireCashierOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const filter = `id eq ${id}`;
    
    const customers = await businessCentralService.getCustomers(filter);
    
    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customers[0]
    });
  } catch (error) {
    logger.error('Error getting customer by ID:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get customer',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/customers/search/:term
 * @desc    Search customers by name or number
 * @access  Private (Cashier/Admin)
 */
router.get('/search/:term', authenticateToken, requireCashierOrAdmin, async (req, res) => {
  try {
    const { term } = req.params;
    const filter = `contains(displayName,'${term}') or contains(number,'${term}')`;
    
    const customers = await businessCentralService.getCustomers(filter);
    
    res.status(200).json({
      success: true,
      data: customers,
      count: customers.length,
      searchTerm: term
    });
  } catch (error) {
    logger.error('Error searching customers:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to search customers',
      message: error.message
    });
  }
});

module.exports = router; 