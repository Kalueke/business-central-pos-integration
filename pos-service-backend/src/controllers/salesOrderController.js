const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const businessCentralService = require('../services/businessCentralService');

// In-memory storage for demo purposes (replace with database in production)
let salesOrders = [];
let orderCounter = 1;

class SalesOrderController {
  /**
   * Create a new sales order
   */
  async createSalesOrder(req, res) {
    try {
      const salesOrderData = req.validatedData;
      
      // Generate internal order ID
      const internalOrderId = uuidv4();
      const orderNumber = `SO-${Date.now()}-${orderCounter++}`;
      
      // Create sales order object
      const salesOrder = {
        id: internalOrderId,
        orderNumber: salesOrderData.orderNumber || orderNumber,
        customerId: salesOrderData.customerId,
        customerName: salesOrderData.customerName,
        customerAddress: salesOrderData.customerAddress || {},
        items: salesOrderData.items,
        subtotal: salesOrderData.subtotal,
        taxAmount: salesOrderData.taxAmount,
        totalAmount: salesOrderData.totalAmount,
        currencyCode: salesOrderData.currencyCode || 'USD',
        paymentMethod: salesOrderData.paymentMethod || '',
        paymentTerms: salesOrderData.paymentTerms || '',
        shipmentMethod: salesOrderData.shipmentMethod || '',
        orderDate: salesOrderData.orderDate || new Date().toISOString(),
        notes: salesOrderData.notes || '',
        status: salesOrderData.status || 'pending',
        bcOrderId: null,
        bcStatus: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to local storage
      salesOrders.push(salesOrder);

      logger.info('Sales order created locally:', {
        orderId: salesOrder.id,
        orderNumber: salesOrder.orderNumber,
        customerId: salesOrder.customerId
      });

      // Send to Business Central
      try {
        const bcResult = await businessCentralService.createSalesOrder(salesOrder);
        
        // Update local record with Business Central info
        salesOrder.bcOrderId = bcResult.bcOrderId;
        salesOrder.bcStatus = bcResult.status;
        salesOrder.status = 'processing';
        salesOrder.updatedAt = new Date().toISOString();

        logger.info('Sales order sent to Business Central successfully:', {
          orderId: salesOrder.id,
          bcOrderId: bcResult.bcOrderId
        });

        return res.status(201).json({
          success: true,
          message: 'Sales order created and sent to Business Central',
          data: {
            ...salesOrder,
            bcIntegration: {
              success: true,
              bcOrderId: bcResult.bcOrderId,
              bcStatus: bcResult.status
            }
          }
        });
      } catch (bcError) {
        logger.error('Failed to send sales order to Business Central:', {
          orderId: salesOrder.id,
          error: bcError.message
        });

        // Return success for local creation but with BC error
        return res.status(201).json({
          success: true,
          message: 'Sales order created locally but failed to send to Business Central',
          data: {
            ...salesOrder,
            bcIntegration: {
              success: false,
              error: bcError.message
            }
          }
        });
      }
    } catch (error) {
      logger.error('Error creating sales order:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to create sales order',
        message: error.message
      });
    }
  }

  /**
   * Get all sales orders with pagination and filtering
   */
  async getSalesOrders(req, res) {
    try {
      const { page = 1, limit = 10, status, customerId, startDate, endDate, sortBy = 'orderDate', sortOrder = 'desc' } = req.validatedQuery;

      let filteredOrders = [...salesOrders];

      // Apply filters
      if (status) {
        filteredOrders = filteredOrders.filter(order => order.status === status);
      }

      if (customerId) {
        filteredOrders = filteredOrders.filter(order => order.customerId === customerId);
      }

      if (startDate) {
        filteredOrders = filteredOrders.filter(order => new Date(order.orderDate) >= new Date(startDate));
      }

      if (endDate) {
        filteredOrders = filteredOrders.filter(order => new Date(order.orderDate) <= new Date(endDate));
      }

      // Apply sorting
      filteredOrders.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'orderDate') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

      const totalOrders = filteredOrders.length;
      const totalPages = Math.ceil(totalOrders / limit);

      return res.status(200).json({
        success: true,
        data: {
          orders: paginatedOrders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalOrders,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) {
      logger.error('Error getting sales orders:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to get sales orders',
        message: error.message
      });
    }
  }

  /**
   * Get a specific sales order by ID
   */
  async getSalesOrderById(req, res) {
    try {
      const { id } = req.params;
      
      const salesOrder = salesOrders.find(order => order.id === id);
      
      if (!salesOrder) {
        return res.status(404).json({
          success: false,
          error: 'Sales order not found'
        });
      }

      // If we have a Business Central ID, try to get updated status
      if (salesOrder.bcOrderId) {
        try {
          const bcOrder = await businessCentralService.getSalesOrder(salesOrder.bcOrderId);
          salesOrder.bcStatus = bcOrder.status;
          salesOrder.updatedAt = new Date().toISOString();
        } catch (bcError) {
          logger.warn('Failed to get updated status from Business Central:', {
            orderId: id,
            bcOrderId: salesOrder.bcOrderId,
            error: bcError.message
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: salesOrder
      });
    } catch (error) {
      logger.error('Error getting sales order by ID:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to get sales order',
        message: error.message
      });
    }
  }

  /**
   * Update a sales order
   */
  async updateSalesOrder(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.validatedData;
      
      const salesOrderIndex = salesOrders.findIndex(order => order.id === id);
      
      if (salesOrderIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Sales order not found'
        });
      }

      const originalOrder = salesOrders[salesOrderIndex];
      
      // Update local order
      salesOrders[salesOrderIndex] = {
        ...originalOrder,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      // If we have a Business Central ID, try to update there too
      if (originalOrder.bcOrderId) {
        try {
          const bcUpdateData = businessCentralService.transformToBusinessCentralFormat(salesOrders[salesOrderIndex]);
          await businessCentralService.updateSalesOrder(originalOrder.bcOrderId, bcUpdateData);
          
          logger.info('Sales order updated in Business Central:', {
            orderId: id,
            bcOrderId: originalOrder.bcOrderId
          });
        } catch (bcError) {
          logger.error('Failed to update sales order in Business Central:', {
            orderId: id,
            bcOrderId: originalOrder.bcOrderId,
            error: bcError.message
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Sales order updated successfully',
        data: salesOrders[salesOrderIndex]
      });
    } catch (error) {
      logger.error('Error updating sales order:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to update sales order',
        message: error.message
      });
    }
  }

  /**
   * Delete a sales order
   */
  async deleteSalesOrder(req, res) {
    try {
      const { id } = req.params;
      
      const salesOrderIndex = salesOrders.findIndex(order => order.id === id);
      
      if (salesOrderIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Sales order not found'
        });
      }

      const salesOrder = salesOrders[salesOrderIndex];
      
      // Remove from local storage
      salesOrders.splice(salesOrderIndex, 1);

      logger.info('Sales order deleted:', {
        orderId: id,
        orderNumber: salesOrder.orderNumber
      });

      return res.status(200).json({
        success: true,
        message: 'Sales order deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting sales order:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete sales order',
        message: error.message
      });
    }
  }

  /**
   * Get sales order statistics
   */
  async getSalesOrderStats(req, res) {
    try {
      const totalOrders = salesOrders.length;
      const pendingOrders = salesOrders.filter(order => order.status === 'pending').length;
      const processingOrders = salesOrders.filter(order => order.status === 'processing').length;
      const completedOrders = salesOrders.filter(order => order.status === 'completed').length;
      const cancelledOrders = salesOrders.filter(order => order.status === 'cancelled').length;

      const totalRevenue = salesOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.totalAmount, 0);

      const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

      // Get orders by date (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentOrders = salesOrders.filter(order => 
        new Date(order.orderDate) >= thirtyDaysAgo
      );

      return res.status(200).json({
        success: true,
        data: {
          totalOrders,
          statusBreakdown: {
            pending: pendingOrders,
            processing: processingOrders,
            completed: completedOrders,
            cancelled: cancelledOrders
          },
          revenue: {
            total: totalRevenue,
            average: averageOrderValue
          },
          recentActivity: {
            ordersLast30Days: recentOrders.length,
            revenueLast30Days: recentOrders
              .filter(order => order.status === 'completed')
              .reduce((sum, order) => sum + order.totalAmount, 0)
          }
        }
      });
    } catch (error) {
      logger.error('Error getting sales order statistics:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to get sales order statistics',
        message: error.message
      });
    }
  }

  /**
   * Test Business Central connection
   */
  async testBusinessCentralConnection(req, res) {
    try {
      const result = await businessCentralService.testConnection();
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error testing Business Central connection:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to test Business Central connection',
        message: error.message
      });
    }
  }
}

module.exports = new SalesOrderController(); 