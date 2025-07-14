# Development Guide

## Overview

This guide provides information for developers who want to extend, customize, or contribute to the POS Integration extension.

## Development Environment Setup

### Prerequisites
- Visual Studio Code
- AL Language extension
- Business Central Docker container
- Git for version control

### Local Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd business-central-pos-integration/business-central-api

# Open in VS Code
code .

# Install dependencies (if any)
npm install
```

### Business Central Container
```bash
# Pull BC container
docker pull mcr.microsoft.com/businesscentral/onprem:22.0.0.0-ltsc2019

# Run container
docker run -e accept_eula=y -e username=admin -e password=P@ssw0rd \
  -p 7049:7049 -p 7080:7080 \
  mcr.microsoft.com/businesscentral/onprem:22.0.0.0-ltsc2019
```

### Launch Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Business Central",
      "type": "al",
      "request": "launch",
      "environmentType": "OnPrem",
      "server": "http://localhost:7049/BC220/ODataV4",
      "serverInstance": "BC220",
      "authentication": "Windows",
      "startupObjectId": 50100,
      "startupObjectType": "Page"
    }
  ]
}
```

## Project Structure

```
business-central-api/
├── app.json                 # Extension manifest
├── POSIntegrationSetup.table.al      # Configuration table
├── POSSyncLog.table.al              # Log table
├── BCPOSIntegration.page.al         # Main setup page
├── POSSyncLog.page.al              # Log page
├── POSIntegrationMgt.codeunit.al   # Business logic
├── docs/                           # Documentation
│   ├── INSTALLATION.md
│   ├── CONFIGURATION.md
│   ├── API_REFERENCE.md
│   ├── USER_GUIDE.md
│   ├── TROUBLESHOOTING.md
│   └── DEVELOPMENT.md
└── README.md                       # Main documentation
```

## Code Architecture

### Design Patterns

#### Service Layer Pattern
The extension uses a service layer pattern with the `POS Integration Mgt.` codeunit handling all business logic.

#### Repository Pattern
Data access is abstracted through table objects with proper validation and triggers.

#### Observer Pattern
Logging and monitoring use an observer pattern to track all activities.

### Key Components

#### Tables
- **POS Integration Setup**: Configuration storage
- **POS Sync Log**: Activity logging

#### Pages
- **BC POS Integration**: Main configuration interface
- **POS Sync Log**: Log management interface

#### Codeunits
- **POS Integration Mgt.**: Core business logic

## Extending the Extension

### Adding New Sync Types

#### 1. Update Sync Type Option
```al
// In POSSyncLog.table.al
field(3; "Sync Type"; Option)
{
    Caption = 'Sync Type';
    OptionCaption = 'Sales Order,Product,Customer,Inventory,Manual,Automatic';
    OptionMembers = "Sales Order",Product,Customer,Inventory,Manual,Automatic;
    DataClassification = CustomerContent;
}
```

#### 2. Add Sync Procedure
```al
// In POSIntegrationMgt.codeunit.al
local procedure SyncInventory(): Boolean
var
    Success: Boolean;
    InventoryData: JsonArray;
begin
    if CallAPI('GET', POSSetup."API Base URL" + '/api/v1/inventory', 
        POSSetup."API Key", POSSetup."API Timeout", '', ResponseText) then begin
        if JsonArray.ReadFrom(ResponseText) then begin
            Success := ProcessInventoryData(InventoryData);
            LogSyncActivity(POSSyncLog."Sync Type"::Inventory, 
                if Success then POSSyncLog.Status::Success else POSSyncLog.Status::Error,
                StrSubstNo('Inventory sync %1', if Success then 'completed' else 'failed'), ResponseText);
        end else begin
            Success := false;
            LogSyncActivity(POSSyncLog."Sync Type"::Inventory, POSSyncLog.Status::Error, 
                'Invalid inventory data format', ResponseText);
        end;
    end else begin
        Success := false;
        LogSyncActivity(POSSyncLog."Sync Type"::Inventory, POSSyncLog.Status::Error, 
            'Failed to fetch inventory from POS', ResponseText);
    end;
    
    exit(Success);
end;
```

#### 3. Update Main Sync Procedure
```al
// In SyncFromPOS procedure
// Add inventory sync
if not SyncInventory() then
    Success := false;
```

### Adding New Configuration Fields

#### 1. Add Field to Setup Table
```al
// In POSIntegrationSetup.table.al
field(22; "Inventory Sync Enabled"; Boolean)
{
    Caption = 'Inventory Sync Enabled';
    DataClassification = CustomerContent;
    InitValue = false;
}
```

#### 2. Update Setup Page
```al
// In BCPOSIntegration.page.al
field(InventorySyncEnabled; InventorySyncEnabled)
{
    ApplicationArea = All;
    Caption = 'Inventory Sync Enabled';
    ToolTip = 'Specifies if inventory synchronization is enabled.';
}
```

#### 3. Update Business Logic
```al
// In POSIntegrationMgt.codeunit.al
if POSSetup."Inventory Sync Enabled" then
    if not SyncInventory() then
        Success := false;
```

### Custom Data Processing

#### Custom Product Processing
```al
local procedure ProcessCustomProductData(ProductData: JsonArray): Boolean
var
    JsonToken: JsonToken;
    ProductObject: JsonObject;
    Item: Record Item;
    Success: Boolean;
begin
    Success := true;
    
    foreach JsonToken in ProductData do begin
        ProductObject := JsonToken.AsObject();
        
        // Extract product data
        if ExtractProductData(ProductObject, Item) then begin
            // Custom processing logic
            if not ProcessCustomProduct(Item, ProductObject) then
                Success := false;
        end else begin
            Success := false;
        end;
    end;
    
    exit(Success);
end;

local procedure ProcessCustomProduct(var Item: Record Item; ProductData: JsonObject): Boolean
var
    JsonToken: JsonToken;
    CustomField: Text;
begin
    // Add custom field processing
    if ProductData.Get('customField', JsonToken) then begin
        CustomField := JsonToken.AsValue().AsText();
        // Process custom field
        Item."Description 2" := CopyStr(CustomField, 1, MaxStrLen(Item."Description 2"));
    end;
    
    exit(true);
end;
```

### Adding New API Endpoints

#### 1. Add API Call Method
```al
local procedure CallCustomAPI(Endpoint: Text; var ResponseText: Text): Boolean
begin
    exit(CallAPI('GET', POSSetup."API Base URL" + Endpoint, 
        POSSetup."API Key", POSSetup."API Timeout", '', ResponseText));
end;
```

#### 2. Add Custom Endpoint Processing
```al
local procedure ProcessCustomEndpoint(): Boolean
var
    Success: Boolean;
    ResponseText: Text;
begin
    if CallCustomAPI('/api/v1/custom-endpoint', ResponseText) then begin
        Success := ProcessCustomResponse(ResponseText);
        LogSyncActivity('Custom', 
            if Success then POSSyncLog.Status::Success else POSSyncLog.Status::Error,
            'Custom endpoint processing completed', ResponseText);
    end else begin
        Success := false;
        LogSyncActivity('Custom', POSSyncLog.Status::Error, 
            'Failed to call custom endpoint', ResponseText);
    end;
    
    exit(Success);
end;
```

## Testing

### Unit Testing

#### Create Test Codeunit
```al
codeunit 50102 "POS Integration Tests"
{
    Subtype = Test;
    
    [Test]
    procedure TestConnection()
    var
        POSIntegrationMgt: Codeunit "POS Integration Mgt.";
        Success: Boolean;
    begin
        // Arrange
        // Set up test data
        
        // Act
        Success := POSIntegrationMgt.TestConnection('http://test-server', 'test-key', 30);
        
        // Assert
        Assert.IsTrue(Success, 'Connection test should succeed');
    end;
    
    [Test]
    procedure TestInvalidAPIKey()
    var
        POSIntegrationMgt: Codeunit "POS Integration Mgt.";
        Success: Boolean;
    begin
        // Arrange
        // Set up test data with invalid key
        
        // Act
        Success := POSIntegrationMgt.TestConnection('http://test-server', 'invalid-key', 30);
        
        // Assert
        Assert.IsFalse(Success, 'Connection test should fail with invalid key');
    end;
}
```

#### Test Data Setup
```al
[TestInitialize]
procedure SetupTestData()
var
    POSSetup: Record "POS Integration Setup";
begin
    // Create test setup record
    POSSetup.Init();
    POSSetup."Primary Key" := 'TEST';
    POSSetup."Integration Enabled" := true;
    POSSetup."API Base URL" := 'http://test-server';
    POSSetup."API Key" := 'test-key';
    POSSetup.Insert();
end;

[TestCleanup]
procedure CleanupTestData()
var
    POSSetup: Record "POS Integration Setup";
    POSSyncLog: Record "POS Sync Log";
begin
    // Clean up test data
    POSSetup.SetRange("Primary Key", 'TEST');
    POSSetup.DeleteAll();
    
    POSSyncLog.SetRange("Source System", 'TEST');
    POSSyncLog.DeleteAll();
end;
```

### Integration Testing

#### Test with Mock POS API
```al
[Test]
procedure TestFullSyncProcess()
var
    POSIntegrationMgt: Codeunit "POS Integration Mgt.";
    Success: Boolean;
    POSSyncLog: Record "POS Sync Log";
begin
    // Arrange
    SetupMockPOSAPI();
    
    // Act
    Success := POSIntegrationMgt.SyncFromPOS();
    
    // Assert
    Assert.IsTrue(Success, 'Full sync should succeed');
    
    // Verify log entries
    POSSyncLog.SetRange("Sync Type", POSSyncLog."Sync Type"::"Sales Order");
    POSSyncLog.SetRange("Status", POSSyncLog.Status::Success);
    Assert.IsTrue(POSSyncLog.FindFirst(), 'Should have successful sync log entry');
end;
```

### Performance Testing

#### Load Testing
```al
[Test]
procedure TestSyncPerformance()
var
    POSIntegrationMgt: Codeunit "POS Integration Mgt.";
    StartTime: DateTime;
    EndTime: DateTime;
    Duration: Integer;
    Success: Boolean;
begin
    // Arrange
    SetupLargeDataset();
    
    // Act
    StartTime := CurrentDateTime;
    Success := POSIntegrationMgt.SyncFromPOS();
    EndTime := CurrentDateTime;
    
    // Assert
    Assert.IsTrue(Success, 'Sync should succeed');
    
    Duration := Duration2Int(EndTime - StartTime);
    Assert.IsTrue(Duration < 60000, 'Sync should complete within 60 seconds');
end;
```

## Debugging

### Debug Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug POS Integration",
      "type": "al",
      "request": "launch",
      "environmentType": "OnPrem",
      "server": "http://localhost:7049/BC220/ODataV4",
      "serverInstance": "BC220",
      "authentication": "Windows",
      "startupObjectId": 50100,
      "startupObjectType": "Page",
      "breakOnError": true,
      "launchBrowser": true
    }
  ]
}
```

### Debug Logging
```al
// Add debug logging
local procedure DebugLog(Message: Text; Data: Variant)
var
    DebugInfo: Text;
begin
    if POSSetup."Log Level" = POSSetup."Log Level"::Debug then begin
        DebugInfo := StrSubstNo('%1: %2', Message, Format(Data));
        LogSyncActivity('Debug', POSSyncLog.Status::Info, DebugInfo, '');
    end;
end;
```

### Error Handling
```al
// Enhanced error handling
local procedure SafeAPI(APICall: Text; var ResponseText: Text): Boolean
var
    Success: Boolean;
    ErrorText: Text;
begin
    Success := false;
    
    if not CallAPI('GET', APICall, POSSetup."API Key", POSSetup."API Timeout", '', ResponseText) then begin
        ErrorText := GetLastErrorText();
        LogSyncActivity('API', POSSyncLog.Status::Error, 
            StrSubstNo('API call failed: %1', APICall), ErrorText);
        exit(false);
    end;
    
    exit(true);
end;
```

## Deployment

### Development Deployment
```bash
# Publish to development environment
al publish --server http://localhost:7049/BC220/ODataV4 --environmentType OnPrem
```

### Production Deployment
```bash
# Publish to production environment
al publish --server https://your-bc-server.com/BC220/ODataV4 --environmentType Cloud
```

### Version Management
```json
{
  "id": "12345678-1234-1234-1234-123456789012",
  "name": "POS Integration",
  "publisher": "Your Company",
  "version": "1.1.0.0",
  "brief": "POS Integration for Business Central v1.1",
  "description": "Enhanced POS integration with new features"
}
```

## Best Practices

### Code Organization
1. **Separation of Concerns**: Keep business logic separate from UI
2. **Single Responsibility**: Each procedure should have one clear purpose
3. **Error Handling**: Always handle errors gracefully
4. **Logging**: Log all important activities and errors

### Performance
1. **Batch Processing**: Process data in batches for large datasets
2. **Connection Pooling**: Reuse HTTP connections when possible
3. **Timeout Management**: Set appropriate timeouts
4. **Memory Management**: Dispose of objects properly

### Security
1. **Input Validation**: Validate all input data
2. **Authentication**: Use secure authentication methods
3. **Data Encryption**: Encrypt sensitive data
4. **Access Control**: Implement proper permissions

### Testing
1. **Unit Tests**: Test individual procedures
2. **Integration Tests**: Test complete workflows
3. **Performance Tests**: Test with realistic data volumes
4. **Security Tests**: Test security measures

## Contributing

### Code Standards
- Follow AL coding conventions
- Use meaningful variable and procedure names
- Add comments for complex logic
- Include error handling

### Documentation
- Update documentation for new features
- Include examples in documentation
- Maintain API reference
- Update user guides

### Testing Requirements
- Write tests for new features
- Ensure all tests pass
- Include performance tests for changes
- Test error scenarios

### Review Process
- Code review required for all changes
- Test in development environment
- Validate against requirements
- Update documentation 