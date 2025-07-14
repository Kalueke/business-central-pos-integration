const express = require('express');
const router = express.Router();
const businessCentralService = require('../services/businessCentralService');
const logger = require('../utils/logger');
const { authenticateToken, requireCashierOrAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/v1/products
 * @desc    Get products from Business Central
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

    const products = await businessCentralService.getProducts(bcFilter);
    
    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    logger.error('Error getting products:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get products',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get a specific product by ID
 * @access  Private (Cashier/Admin)
 */
router.get('/:id', authenticateToken, requireCashierOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const filter = `id eq ${id}`;
    
    const products = await businessCentralService.getProducts(filter);
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: products[0]
    });
  } catch (error) {
    logger.error('Error getting product by ID:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get product',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/products/search/:term
 * @desc    Search products by name or number
 * @access  Private (Cashier/Admin)
 */
router.get('/search/:term', authenticateToken, requireCashierOrAdmin, async (req, res) => {
  try {
    const { term } = req.params;
    const filter = `contains(displayName,'${term}') or contains(number,'${term}')`;
    
    const products = await businessCentralService.getProducts(filter);
    
    res.status(200).json({
      success: true,
      data: products,
      count: products.length,
      searchTerm: term
    });
  } catch (error) {
    logger.error('Error searching products:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to search products',
      message: error.message
    });
  }
});

module.exports = router; 