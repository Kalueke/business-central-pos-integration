const axios = require('axios');
const logger = require('../utils/logger');

class BusinessCentralService {
  constructor() {
    this.baseURL = process.env.BC_BASE_URL;
    this.tenantId = process.env.BC_TENANT_ID;
    this.clientId = process.env.BC_CLIENT_ID;
    this.clientSecret = process.env.BC_CLIENT_SECRET;
    this.companyId = process.env.BC_COMPANY_ID;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get access token for Business Central API
   */
  async getAccessToken() {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
      
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: `${this.baseURL}/.default`
      });

      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      logger.info('Successfully obtained Business Central access token');
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get Business Central access token:', error.message);
      throw new Error('Failed to authenticate with Business Central');
    }
  }

  /**
   * Create HTTP client with authentication headers
   */
  async createAuthenticatedClient() {
    const token = await this.getAccessToken();
    
    return axios.create({
      baseURL: `${this.baseURL}/${this.tenantId}/${this.companyId}/api/v2.0`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Create a sales order in Business Central
   */
  async createSalesOrder(salesOrderData) {
    try {
      const client = await this.createAuthenticatedClient();
      
      // Transform POS data to Business Central format
      const bcSalesOrder = this.transformToBusinessCentralFormat(salesOrderData);
      
      logger.info('Creating sales order in Business Central:', {
        orderNumber: salesOrderData.orderNumber,
        customerId: salesOrderData.customerId
      });

      const response = await client.post('/salesOrders', bcSalesOrder);
      
      logger.info('Sales order created successfully in Business Central:', {
        bcOrderId: response.data.id,
        orderNumber: salesOrderData.orderNumber
      });

      return {
        success: true,
        bcOrderId: response.data.id,
        orderNumber: response.data.number,
        status: response.data.status
      };
    } catch (error) {
      logger.error('Failed to create sales order in Business Central:', {
        error: error.message,
        orderNumber: salesOrderData.orderNumber,
        response: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Get sales order from Business Central
   */
  async getSalesOrder(orderId) {
    try {
      const client = await this.createAuthenticatedClient();
      
      const response = await client.get(`/salesOrders(${orderId})`);
      
      return response.data;
    } catch (error) {
      logger.error('Failed to get sales order from Business Central:', error.message);
      throw error;
    }
  }

  /**
   * Update sales order in Business Central
   */
  async updateSalesOrder(orderId, updateData) {
    try {
      const client = await this.createAuthenticatedClient();
      
      const response = await client.patch(`/salesOrders(${orderId})`, updateData);
      
      return response.data;
    } catch (error) {
      logger.error('Failed to update sales order in Business Central:', error.message);
      throw error;
    }
  }

  /**
   * Get products from Business Central
   */
  async getProducts(filter = '') {
    try {
      const client = await this.createAuthenticatedClient();
      
      const url = filter ? `/items?$filter=${filter}` : '/items';
      const response = await client.get(url);
      
      return response.data.value;
    } catch (error) {
      logger.error('Failed to get products from Business Central:', error.message);
      throw error;
    }
  }

  /**
   * Get customers from Business Central
   */
  async getCustomers(filter = '') {
    try {
      const client = await this.createAuthenticatedClient();
      
      const url = filter ? `/customers?$filter=${filter}` : '/customers';
      const response = await client.get(url);
      
      return response.data.value;
    } catch (error) {
      logger.error('Failed to get customers from Business Central:', error.message);
      throw error;
    }
  }

  /**
   * Transform POS sales order data to Business Central format
   */
  transformToBusinessCentralFormat(posData) {
    return {
      customerNumber: posData.customerId,
      orderDate: posData.orderDate || new Date().toISOString().split('T')[0],
      externalDocumentNumber: posData.orderNumber,
      sellToCustomerName: posData.customerName,
      sellToAddress: {
        street: posData.customerAddress?.street || '',
        city: posData.customerAddress?.city || '',
        state: posData.customerAddress?.state || '',
        countryRegionCode: posData.customerAddress?.country || 'US',
        postalCode: posData.customerAddress?.postalCode || ''
      },
      salesOrderLines: posData.items.map(item => ({
        itemId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineAmount: item.lineTotal,
        description: item.description || item.productName
      })),
      // Additional fields as needed
      currencyCode: posData.currencyCode || 'USD',
      paymentTermsCode: posData.paymentTerms || 'NET30',
      shipmentMethodCode: posData.shipmentMethod || 'STANDARD'
    };
  }

  /**
   * Test connection to Business Central
   */
  async testConnection() {
    try {
      const client = await this.createAuthenticatedClient();
      const response = await client.get('/companies');
      
      return {
        success: true,
        message: 'Successfully connected to Business Central',
        companies: response.data.value
      };
    } catch (error) {
      logger.error('Business Central connection test failed:', error.message);
      return {
        success: false,
        message: 'Failed to connect to Business Central',
        error: error.message
      };
    }
  }
}

module.exports = new BusinessCentralService(); 