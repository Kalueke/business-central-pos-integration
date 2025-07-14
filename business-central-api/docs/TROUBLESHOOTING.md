# Troubleshooting Guide

## Quick Diagnostic Steps

### 1. Check Integration Status
1. Open "BC POS Integration" page
2. Verify "Integration Enabled" is set to Yes
3. Check "Sync Status" field
4. Review "Last Sync Date/Time"

### 2. Test Connection
1. Click "Test Connection" action
2. Wait for result message
3. Check sync log for details

### 3. Review Recent Logs
1. Click "View Sync Log" action
2. Look for recent error entries
3. Check error messages and details

## Common Issues

### Connection Issues

#### Issue: "Connection test failed"
**Symptoms**:
- Test Connection action returns failure
- Sync Status shows "Failed"
- No recent successful syncs

**Diagnostic Steps**:
1. **Check POS System Status**
   ```bash
   # Test if POS system is running
   curl -I http://your-pos-server:3001/api/v1/health
   ```

2. **Verify Network Connectivity**
   ```bash
   # Test network connectivity
   ping your-pos-server
   telnet your-pos-server 3001
   ```

3. **Check Firewall Settings**
   - Verify port 3001 (or your POS port) is open
   - Check Windows Firewall rules
   - Verify network security groups (if cloud)

**Solutions**:
1. **Start POS System**
   ```bash
   # Start POS service
   npm start
   # or
   systemctl start pos-service
   ```

2. **Update API URL**
   - Verify API Base URL is correct
   - Check for typos in URL
   - Ensure protocol (http/https) is correct

3. **Configure Firewall**
   ```powershell
   # Windows Firewall rule
   New-NetFirewallRule -DisplayName "POS API" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
   ```

#### Issue: "401 Unauthorized"
**Symptoms**:
- Connection test fails with 401 error
- API calls return unauthorized

**Diagnostic Steps**:
1. **Verify API Key**
   - Check API Key in configuration
   - Ensure no extra spaces or characters
   - Verify key is not expired

2. **Test API Authentication**
   ```bash
   # Test with curl
   curl -H "Authorization: Bearer your-api-key" http://your-pos-server:3001/api/v1/health
   ```

**Solutions**:
1. **Update API Key**
   - Get new API key from POS system
   - Update configuration
   - Test connection again

2. **Check API Key Format**
   - Ensure proper Bearer token format
   - Remove any extra characters
   - Verify key length

### Data Synchronization Issues

#### Issue: "No sales orders created"
**Symptoms**:
- Manual sync succeeds
- No new sales orders appear in BC
- Sync log shows success but no data

**Diagnostic Steps**:
1. **Check POS Data**
   ```bash
   # Check if POS has orders
   curl -H "Authorization: Bearer your-api-key" http://your-pos-server:3001/api/v1/sales-orders
   ```

2. **Verify Auto-Create Setting**
   - Check "Auto Create Sales Orders" setting
   - Ensure it's enabled if you want automatic creation

3. **Check Default Values**
   - Verify "Default Customer No." exists in BC
   - Verify "Default Location Code" exists in BC

**Solutions**:
1. **Enable Auto-Create**
   - Set "Auto Create Sales Orders" to Yes
   - Test manual sync

2. **Create Default Records**
   ```al
   // Create default customer
   Customer.Init();
   Customer."No." := 'WALKIN';
   Customer.Name := 'Walk-in Customer';
   Customer.Insert();
   
   // Create default location
   Location.Init();
   Location.Code := 'MAIN';
   Location.Name := 'Main Location';
   Location.Insert();
   ```

3. **Check Data Mapping**
   - Review POS data format
   - Verify field mappings
   - Check for required fields

#### Issue: "Invalid data format"
**Symptoms**:
- Sync fails with data format errors
- JSON parsing errors in log
- Missing required fields

**Diagnostic Steps**:
1. **Check POS API Response**
   ```bash
   # Get sample data
   curl -H "Authorization: Bearer your-api-key" http://your-pos-server:3001/api/v1/sales-orders | jq .
   ```

2. **Review Data Structure**
   - Compare POS data format with expected format
   - Check for missing required fields
   - Verify data types

**Solutions**:
1. **Update POS Data Format**
   - Ensure POS returns expected JSON structure
   - Add missing required fields
   - Fix data type mismatches

2. **Modify Data Processing**
   ```al
   // Add custom data processing logic
   local procedure ProcessCustomData(JsonData: JsonObject): Boolean
   begin
       // Custom processing logic
       exit(true);
   end;
   ```

### Performance Issues

#### Issue: "Sync timeout"
**Symptoms**:
- Sync operations timeout
- Long sync durations
- Performance degradation

**Diagnostic Steps**:
1. **Check Network Performance**
   ```bash
   # Test network latency
   ping your-pos-server
   traceroute your-pos-server
   ```

2. **Monitor POS System**
   - Check CPU and memory usage
   - Monitor database performance
   - Check for slow queries

3. **Review Sync Settings**
   - Check API Timeout setting
   - Review sync interval
   - Monitor log for performance data

**Solutions**:
1. **Increase Timeout**
   - Increase "API Timeout" setting
   - Set appropriate retry delays
   - Adjust sync intervals

2. **Optimize POS System**
   - Add database indexes
   - Optimize API queries
   - Increase server resources

3. **Batch Processing**
   - Implement batch processing for large datasets
   - Use pagination for API calls
   - Optimize data transfer

### Log Management Issues

#### Issue: "Log table full"
**Symptoms**:
- Slow log page loading
- Database space issues
- Performance problems

**Diagnostic Steps**:
1. **Check Log Size**
   ```sql
   -- Check log table size
   SELECT COUNT(*) FROM "POS Sync Log";
   SELECT MAX("Entry No.") FROM "POS Sync Log";
   ```

2. **Review Log Retention**
   - Check log cleanup settings
   - Review log level configuration
   - Monitor log growth

**Solutions**:
1. **Clear Old Logs**
   - Use "Clear Log" action
   - Set up automatic cleanup
   - Archive old log data

2. **Adjust Log Level**
   - Set appropriate log level
   - Reduce debug logging in production
   - Monitor log volume

## Advanced Troubleshooting

### Database Issues

#### Check Database Connectivity
```sql
-- Test database connection
SELECT @@VERSION;
SELECT GETDATE();
```

#### Verify Table Structure
```sql
-- Check table structure
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'POS Integration Setup';
```

#### Check Permissions
```sql
-- Check user permissions
SELECT * FROM sys.database_permissions 
WHERE grantee_principal_id = USER_ID('your-username');
```

### Network Diagnostics

#### Test API Endpoints
```bash
# Test health endpoint
curl -v http://your-pos-server:3001/api/v1/health

# Test with authentication
curl -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     http://your-pos-server:3001/api/v1/sales-orders
```

#### Check SSL/TLS
```bash
# Test SSL connection
openssl s_client -connect your-pos-server:443

# Check certificate
openssl x509 -in certificate.pem -text -noout
```

### Performance Monitoring

#### Monitor Sync Performance
```al
// Add performance monitoring
local procedure MonitorPerformance(StartTime: DateTime; EndTime: DateTime)
var
    Duration: Integer;
begin
    Duration := Duration2Int(EndTime - StartTime);
    if Duration > 30000 then // 30 seconds
        LogSyncActivity('Performance', POSSyncLog.Status::Warning, 
            StrSubstNo('Slow sync detected: %1 ms', Duration), '');
end;
```

#### Database Performance
```sql
-- Check slow queries
SELECT TOP 10 
    qs.execution_count,
    qs.total_elapsed_time / qs.execution_count as avg_elapsed_time,
    SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(qt.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2) + 1) as statement_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY avg_elapsed_time DESC;
```

## Error Code Reference

### Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| CONNECTION_FAILED | Network connection failed | Check network and firewall |
| AUTH_FAILED | Authentication failed | Verify API key |
| TIMEOUT | Request timeout | Increase timeout setting |
| INVALID_DATA | Invalid data format | Check data structure |
| CUSTOMER_NOT_FOUND | Customer does not exist | Create customer in BC |
| LOCATION_NOT_FOUND | Location does not exist | Create location in BC |
| PERMISSION_DENIED | Insufficient permissions | Grant required permissions |
| RATE_LIMIT | API rate limit exceeded | Reduce sync frequency |
| SERVER_ERROR | POS server error | Check POS system status |

### HTTP Status Codes

| Status Code | Meaning | Action |
|-------------|---------|--------|
| 200 | Success | No action needed |
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Verify API key |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify API endpoint |
| 429 | Too Many Requests | Reduce request frequency |
| 500 | Internal Server Error | Check POS system |
| 502 | Bad Gateway | Check network |
| 503 | Service Unavailable | Wait and retry |
| 504 | Gateway Timeout | Increase timeout |

## Recovery Procedures

### System Recovery

#### Complete Reset
1. **Disable Integration**
   - Set "Integration Enabled" to No
   - Clear all configuration

2. **Clean Up Data**
   ```sql
   -- Clear sync log
   DELETE FROM "POS Sync Log";
   
   -- Reset setup
   UPDATE "POS Integration Setup" 
   SET "Integration Enabled" = 0,
       "Sync Status" = 0,
       "Total Orders Synced" = 0,
       "Failed Syncs" = 0;
   ```

3. **Reconfigure**
   - Enter all configuration settings
   - Test connection
   - Enable integration

#### Partial Recovery
1. **Reset Sync Status**
   - Set "Sync Status" to "Not Started"
   - Clear "Last Sync Date/Time"

2. **Test Components**
   - Test connection
   - Test manual sync
   - Verify data creation

### Data Recovery

#### Restore Configuration
```sql
-- Backup configuration
SELECT * INTO POS_Setup_Backup 
FROM "POS Integration Setup";

-- Restore configuration
INSERT INTO "POS Integration Setup"
SELECT * FROM POS_Setup_Backup;
```

#### Recover Sync Data
```sql
-- Export sync log
SELECT * FROM "POS Sync Log" 
WHERE "Date/Time" >= DATEADD(day, -7, GETDATE())
ORDER BY "Date/Time" DESC;
```

## Prevention Strategies

### Monitoring Setup
1. **Set Up Alerts**
   - Configure email alerts for sync failures
   - Set up performance monitoring
   - Monitor disk space

2. **Regular Maintenance**
   - Schedule log cleanup
   - Monitor performance metrics
   - Update configuration as needed

3. **Backup Procedures**
   - Regular configuration backups
   - Database backups
   - Documentation updates

### Best Practices
1. **Test Changes**
   - Test in development first
   - Use staging environment
   - Validate configuration

2. **Documentation**
   - Keep troubleshooting guide updated
   - Document custom configurations
   - Maintain change log

3. **Training**
   - Train users on common issues
   - Provide troubleshooting resources
   - Regular system reviews 