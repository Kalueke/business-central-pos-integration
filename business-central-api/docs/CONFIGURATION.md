# Configuration Guide

## Overview

The POS Integration extension requires careful configuration to ensure proper communication between Business Central and your POS system. This guide covers all configuration options and best practices.

## Configuration Page

### Accessing Configuration
1. **Open Business Central**
2. **Search for "POS Integration"**
3. **Click on "BC POS Integration"**

## General Settings

### Integration Enabled
- **Purpose**: Master switch to enable/disable the entire integration
- **Default**: No
- **Recommendation**: Set to Yes only after all other settings are configured

### Auto Create Sales Orders
- **Purpose**: Automatically create sales orders when POS data is synced
- **Default**: No
- **Recommendation**: Enable for automated workflows, disable for manual review

### Default Customer No.
- **Purpose**: Default customer for POS sales orders when customer is not specified
- **Type**: Customer Code (20 characters)
- **Validation**: Must exist in Customer table
- **Recommendation**: Create a generic "POS Customer" for walk-in sales

### Default Location Code
- **Purpose**: Default location for inventory management
- **Type**: Location Code (10 characters)
- **Validation**: Must exist in Location table
- **Recommendation**: Use your main warehouse or store location

## API Settings

### API Base URL
- **Purpose**: Base URL for POS API endpoints
- **Format**: `http://hostname:port` or `https://hostname:port`
- **Examples**:
  ```
  http://localhost:3001
  https://pos.company.com
  http://192.168.1.100:8080
  ```
- **Validation**: Must be accessible from Business Central server

### API Key
- **Purpose**: Authentication token for POS API access
- **Type**: Text (100 characters)
- **Security**: Stored encrypted in database
- **Format**: Usually provided by POS system administrator
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### API Timeout
- **Purpose**: Maximum time to wait for API response
- **Unit**: Seconds
- **Default**: 30
- **Range**: 10-300 seconds
- **Recommendation**: 30-60 seconds for most environments

## Sync Settings

### Sync Interval
- **Purpose**: Interval for automatic synchronization
- **Unit**: Minutes
- **Default**: 15
- **Range**: 1-1440 minutes (24 hours)
- **Recommendation**: 
  - Development: 5-15 minutes
  - Production: 15-60 minutes
  - High-volume: 5-10 minutes

### Last Sync Date/Time
- **Purpose**: Timestamp of last successful synchronization
- **Type**: Read-only
- **Format**: DateTime
- **Usage**: Monitor sync frequency and troubleshoot issues

### Sync Status
- **Purpose**: Current synchronization status
- **Options**:
  - Not Started
  - In Progress
  - Completed
  - Failed
- **Type**: Read-only
- **Usage**: Monitor sync health

## Advanced Settings

### Webhook URL
- **Purpose**: URL for POS system to send real-time updates
- **Format**: `http://bc-server:port/api/v1/webhook`
- **Optional**: Not required for basic integration
- **Security**: Should use HTTPS in production

### Webhook Enabled
- **Purpose**: Enable real-time webhook notifications
- **Default**: No
- **Requirement**: Requires webhook URL to be configured

### Retry Attempts
- **Purpose**: Number of retry attempts for failed API calls
- **Default**: 3
- **Range**: 1-10
- **Recommendation**: 3-5 attempts

### Retry Delay
- **Purpose**: Delay between retry attempts
- **Unit**: Seconds
- **Default**: 60
- **Range**: 10-300 seconds
- **Recommendation**: 30-120 seconds

### Log Level
- **Purpose**: Level of detail for logging
- **Options**:
  - Error: Only errors
  - Warning: Errors and warnings
  - Info: Errors, warnings, and info messages
  - Debug: All messages including debug info
- **Default**: Info
- **Recommendation**: Use Debug for troubleshooting, Info for production

## Configuration Examples

### Development Environment
```al
POSSetup."Integration Enabled" := true;
POSSetup."API Base URL" := 'http://localhost:3001';
POSSetup."API Key" := 'dev-api-key-123';
POSSetup."API Timeout" := 30;
POSSetup."Sync Interval" := 5;
POSSetup."Default Customer No." := 'POS001';
POSSetup."Default Location Code" := 'DEV';
POSSetup."Log Level" := POSSetup."Log Level"::Debug;
```

### Production Environment
```al
POSSetup."Integration Enabled" := true;
POSSetup."API Base URL" := 'https://pos.company.com';
POSSetup."API Key" := 'prod-api-key-456';
POSSetup."API Timeout" := 60;
POSSetup."Sync Interval" := 15;
POSSetup."Default Customer No." := 'WALKIN';
POSSetup."Default Location Code" := 'MAIN';
POSSetup."Log Level" := POSSetup."Log Level"::Info;
POSSetup."Retry Attempts" := 5;
POSSetup."Retry Delay (seconds)" := 120;
```

### High-Volume Environment
```al
POSSetup."Integration Enabled" := true;
POSSetup."API Base URL" := 'https://pos.company.com';
POSSetup."API Key" := 'high-volume-key-789';
POSSetup."API Timeout" := 30;
POSSetup."Sync Interval" := 5;
POSSetup."Auto Create Sales Orders" := true;
POSSetup."Default Customer No." := 'WALKIN';
POSSetup."Default Location Code" := 'MAIN';
POSSetup."Retry Attempts" := 3;
POSSetup."Retry Delay (seconds)" := 30;
```

## Security Considerations

### API Key Management
- **Storage**: Keys are encrypted in the database
- **Rotation**: Change API keys regularly
- **Access**: Limit access to configuration page
- **Audit**: Log all configuration changes

### Network Security
- **Firewall**: Configure firewall rules for API access
- **HTTPS**: Use HTTPS for production environments
- **VPN**: Consider VPN for secure connections
- **IP Whitelisting**: Restrict access by IP address

### Data Protection
- **Encryption**: All sensitive data is encrypted
- **Logging**: Avoid logging sensitive data
- **Access Control**: Implement proper user permissions
- **Audit Trail**: Maintain configuration change history

## Validation Rules

### Required Fields
- API Base URL (when integration enabled)
- API Key (when integration enabled)
- Default Customer No. (when auto-create enabled)
- Default Location Code (when auto-create enabled)

### Format Validation
- API Base URL: Valid URL format
- API Timeout: 10-300 seconds
- Sync Interval: 1-1440 minutes
- Retry Attempts: 1-10
- Retry Delay: 10-300 seconds

### Business Logic Validation
- Customer No. must exist in Customer table
- Location Code must exist in Location table
- API Base URL must be accessible
- API Key must be valid

## Troubleshooting Configuration

### Common Issues

#### Invalid API Base URL
```
Error: "Invalid URL format"
Solution: Ensure URL includes protocol (http:// or https://)
```

#### API Key Authentication Failed
```
Error: "401 Unauthorized"
Solution: Verify API key is correct and not expired
```

#### Customer Not Found
```
Error: "Customer does not exist"
Solution: Create the default customer in Business Central
```

#### Location Not Found
```
Error: "Location does not exist"
Solution: Create the default location in Business Central
```

### Configuration Validation
```al
// Validate configuration before enabling integration
if POSSetup."Integration Enabled" then begin
    if POSSetup."API Base URL" = '' then
        Error('API Base URL is required when integration is enabled');
    
    if POSSetup."API Key" = '' then
        Error('API Key is required when integration is enabled');
    
    if POSSetup."Auto Create Sales Orders" then begin
        if POSSetup."Default Customer No." = '' then
            Error('Default Customer No. is required when auto-create is enabled');
        
        if POSSetup."Default Location Code" = '' then
            Error('Default Location Code is required when auto-create is enabled');
    end;
end;
```

## Best Practices

### Configuration Management
1. **Document Settings**: Keep configuration documentation updated
2. **Version Control**: Track configuration changes
3. **Testing**: Test configuration in development first
4. **Backup**: Backup configuration before changes
5. **Monitoring**: Monitor configuration effectiveness

### Performance Optimization
1. **Sync Interval**: Balance between real-time and performance
2. **Timeout Settings**: Set appropriate timeouts for your network
3. **Retry Logic**: Configure retry attempts based on reliability
4. **Log Level**: Use appropriate log level for environment

### Security Best Practices
1. **Regular Key Rotation**: Change API keys periodically
2. **Least Privilege**: Grant minimum required permissions
3. **Network Security**: Use secure connections
4. **Audit Logging**: Monitor configuration changes
5. **Access Control**: Restrict configuration access 