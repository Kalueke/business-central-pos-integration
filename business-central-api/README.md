# Business Central POS Integration Extension

This AL extension provides integration between a POS (Point of Sale) system and Microsoft Business Central for seamless sales order management.

## Features

### 🔧 Configuration Management
- **Integration Setup Page** - Centralized configuration for POS integration
- **API Settings** - Configure API endpoints, authentication, and timeouts
- **Sync Settings** - Control automatic synchronization intervals and behavior
- **Default Values** - Set default customers, locations, and other parameters

### 📊 Monitoring & Logging
- **Sync Log** - Comprehensive logging of all synchronization activities
- **Statistics Tracking** - Monitor success rates, total orders synced, and failed attempts
- **Real-time Status** - View current sync status and last sync timestamps
- **Export Capabilities** - Export log data for analysis and reporting

### 🔄 Synchronization
- **Manual Sync** - Trigger synchronization on-demand
- **Automatic Sync** - Scheduled synchronization based on configured intervals
- **Product Sync** - Synchronize product catalog from POS to Business Central
- **Customer Sync** - Synchronize customer data between systems
- **Sales Order Sync** - Create sales orders in Business Central from POS data

### 🛠️ Management Tools
- **Connection Testing** - Test API connectivity and authentication
- **Sales Order Creation** - Manually create sales orders from POS data
- **Log Management** - Clear old log entries and export data
- **Error Handling** - Comprehensive error handling with retry mechanisms

## Installation

### Prerequisites
- Microsoft Business Central (version 22.0 or later)
- AL Development Environment
- Access to POS API endpoints

### Setup Instructions

1. **Install the Extension**
   ```bash
   # Publish the extension to your Business Central environment
   al publish --server http://localhost:7049/BC220/ODataV4 --environmentType OnPrem
   ```

2. **Configure Integration Settings**
   - Navigate to **POS Integration Setup** page
   - Enter your POS API configuration:
     - API Base URL (e.g., `http://localhost:3001`)
     - API Key for authentication
     - Timeout settings
   - Set default values:
     - Default Customer No.
     - Default Location Code
   - Configure sync settings:
     - Sync interval (minutes)
     - Enable/disable automatic sync
     - Enable/disable auto-create sales orders

3. **Test Connection**
   - Use the **Test Connection** action to verify API connectivity
   - Check the sync log for connection status

## Usage

### Main Integration Page

The **BC POS Integration** page provides a comprehensive interface for managing the integration:

#### General Settings
- **Integration Enabled** - Master switch to enable/disable integration
- **Auto Create Sales Orders** - Automatically create sales orders from POS data
- **Default Customer No.** - Default customer for POS sales orders
- **Default Location Code** - Default location for inventory management

#### API Settings
- **API Base URL** - Base URL for POS API endpoints
- **API Key** - Authentication key for API access
- **API Timeout** - Request timeout in seconds

#### Sync Settings
- **Sync Interval** - Automatic sync interval in minutes
- **Last Sync Date/Time** - Timestamp of last successful sync
- **Sync Status** - Current synchronization status

#### Statistics
- **Total Orders Synced** - Count of successfully synced orders
- **Failed Syncs** - Count of failed synchronization attempts
- **Success Rate** - Percentage of successful syncs

### Actions Available

#### Test Connection
Tests the connection to the POS API and verifies authentication.

#### Manual Sync
Triggers a manual synchronization of all data types (products, customers, sales orders).

#### Create Sales Order
Manually creates a sales order in Business Central from the latest POS data.

#### View Sync Log
Opens the sync log page to view detailed synchronization history.

### Sync Log Management

The **POS Sync Log** page provides detailed information about all synchronization activities:

#### Log Entries Include
- **Date/Time** - When the sync activity occurred
- **Sync Type** - Type of synchronization (Sales Order, Product, Customer, etc.)
- **Status** - Success, Error, Warning, or Info
- **Message** - Descriptive message about the activity
- **User ID** - User who performed the action
- **Duration** - Time taken for the sync operation
- **Retry Count** - Number of retry attempts
- **Error Details** - Detailed error information if applicable

#### Log Actions
- **Clear Log** - Remove old log entries (configurable retention period)
- **Export Log** - Export log data to CSV format
- **Refresh** - Refresh the log display

## Configuration

### Environment Variables

The extension uses the following configuration settings stored in the **POS Integration Setup** table:

```al
// Example configuration
POSSetup."Integration Enabled" := true;
POSSetup."API Base URL" := 'http://localhost:3001';
POSSetup."API Key" := 'your-api-key-here';
POSSetup."API Timeout" := 30;
POSSetup."Sync Interval" := 15;
POSSetup."Default Customer No." := 'C00001';
POSSetup."Default Location Code" := 'MAIN';
```

### API Endpoints

The extension expects the following POS API endpoints:

- `GET /api/v1/health` - Health check endpoint
- `GET /api/v1/products` - Product catalog
- `GET /api/v1/customers` - Customer data
- `GET /api/v1/sales-orders` - Sales orders

### Authentication

The extension supports Bearer token authentication:
```
Authorization: Bearer your-api-key-here
```

## Development

### Project Structure

```
business-central-api/
├── app.json                 # Extension manifest
├── POSIntegrationSetup.table.al      # Configuration table
├── POSSyncLog.table.al              # Log table
├── BCPOSIntegration.page.al         # Main setup page
├── POSSyncLog.page.al              # Log page
├── POSIntegrationMgt.codeunit.al   # Business logic
└── README.md                       # This file
```

### Customization

To customize the integration for your specific needs:

1. **Modify API Endpoints** - Update the `CallAPI` procedure in the codeunit
2. **Customize Data Mapping** - Modify the data processing procedures
3. **Add New Sync Types** - Extend the sync type options and processing logic
4. **Enhance Logging** - Add additional logging fields or procedures

### Testing

1. **Unit Tests** - Create test codeunits for individual procedures
2. **Integration Tests** - Test with actual POS API endpoints
3. **Performance Testing** - Monitor sync performance and optimize as needed

## Troubleshooting

### Common Issues

1. **Connection Failures**
   - Verify API Base URL is correct
   - Check API Key authentication
   - Ensure POS service is running
   - Check network connectivity

2. **Sync Failures**
   - Review sync log for detailed error messages
   - Check data format compatibility
   - Verify Business Central permissions
   - Monitor API rate limits

3. **Performance Issues**
   - Adjust sync intervals
   - Optimize data processing procedures
   - Monitor system resources
   - Consider batch processing for large datasets

### Log Analysis

Use the sync log to diagnose issues:

```al
// Example: Find recent errors
POSSyncLog.SetRange("Status", POSSyncLog.Status::Error);
POSSyncLog.SetRange("Date/Time", CurrentDateTime - 24 * 60 * 60 * 1000, CurrentDateTime);
if POSSyncLog.FindSet() then
    repeat
        // Process error entries
    until POSSyncLog.Next() = 0;
```

## Support

For support and questions:
- Check the sync log for detailed error information
- Review Business Central event logs
- Contact your system administrator
- Refer to Business Central documentation

## Version History

### v1.0.0
- Initial release
- Basic POS integration functionality
- Configuration management
- Sync logging and monitoring
- Manual and automatic synchronization 