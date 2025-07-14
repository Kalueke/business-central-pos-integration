const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/v1/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'POS Service Backend is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

/**
 * @route   GET /api/v1/health/detailed
 * @desc    Detailed health check with system information
 * @access  Public
 */
router.get('/detailed', (req, res) => {
  const healthInfo = {
    success: true,
    message: 'POS Service Backend detailed health check',
    timestamp: new Date().toISOString(),
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    },
    services: {
      businessCentral: {
        configured: !!(process.env.BC_BASE_URL && process.env.BC_TENANT_ID),
        status: 'unknown' // Would be checked in a real implementation
      }
    },
    version: '1.0.0'
  };

  res.status(200).json(healthInfo);
});

module.exports = router; 