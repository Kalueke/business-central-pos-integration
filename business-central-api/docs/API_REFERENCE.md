# API Reference

## Overview

This document provides detailed information about the API endpoints, data structures, and integration patterns used by the POS Integration extension.

## Codeunit Reference

### POS Integration Mgt. (50100)

#### Public Procedures

##### TestConnection
```al
procedure TestConnection(APIBaseURL: Text; APIKey: Text; Timeout: Integer): Boolean
```

**Purpose**: Tests the connection to the POS API and verifies authentication.

**Parameters**:
- `APIBaseURL` (Text): Base URL for the POS API
- `APIKey` (Text): Authentication key for API access
- `Timeout` (Integer): Request timeout in seconds

**Returns**: Boolean - True if connection successful, False otherwise

**Example**:
```al
var
    POSIntegrationMgt: Codeunit "POS Integration Mgt.";
    Success: Boolean;
begin
    Success := POSIntegrationMgt.TestConnection('http://localhost:3001', 'api-key-123', 30);
    if Success then
        Message('Connection successful')
    else
        Message('Connection failed');
end;
```

##### SyncFromPOS
```al
procedure SyncFromPOS(): Boolean
```

**Purpose**: Performs a complete synchronization from POS system to Business Central.

**Returns**: Boolean - True if sync completed successfully, False otherwise

**Process**:
1. Syncs products from POS to BC
2. Syncs customers from POS to BC
3. Syncs sales orders from POS to BC
4. Updates sync statistics
5. Logs all activities

**Example**:
```al
var
    POSIntegrationMgt: Codeunit "POS Integration Mgt.";
    Success: Boolean;
begin
    Success := POSIntegrationMgt.SyncFromPOS();
    if Success then
        Message('Synchronization completed successfully')
    else
        Message('Synchronization failed');
end;
```

##### CreateSalesOrderFromPOS
```al
procedure CreateSalesOrderFromPOS(var SalesHeader: Record "Sales Header"): Boolean
```

**Purpose**: Creates a sales order in Business Central from the latest POS data.

**Parameters**:
- `SalesHeader` (Record "Sales Header"): Output parameter containing the created sales order

**Returns**: Boolean - True if sales order created successfully, False otherwise

**Example**:
```al
var
    POSIntegrationMgt: Codeunit "POS Integration Mgt.";
    SalesHeader: Record "Sales Header";
    Success: Boolean;
begin
    Success := POSIntegrationMgt.CreateSalesOrderFromPOS(SalesHeader);
    if Success then
        Message('Sales order %1 created successfully', SalesHeader."No.")
    else
        Message('Failed to create sales order');
end;
```

#### Local Procedures

##### GetPOSSetup
```al
local procedure GetPOSSetup(): Boolean
```

**Purpose**: Retrieves or creates the POS integration setup record.

**Returns**: Boolean - True if setup record exists or was created

##### CallAPI
```al
local procedure CallAPI(Method: Text; URL: Text; APIKey: Text; Timeout: Integer; RequestBody: Text; var ResponseBody: Text): Boolean
```

**Purpose**: Makes HTTP requests to the POS API.

**Parameters**:
- `Method` (Text): HTTP method (GET, POST, PUT, DELETE)
- `URL` (Text): Full URL for the API endpoint
- `APIKey` (Text): Authentication key
- `Timeout` (Integer): Request timeout in seconds
- `RequestBody` (Text): Request body for POST/PUT requests
- `ResponseBody` (Text): Output parameter containing API response

**Returns**: Boolean - True if request successful, False otherwise

**Headers Set**:
- Content-Type: application/json
- Authorization: Bearer {APIKey}

##### SyncProducts
```al
local procedure SyncProducts(): Boolean
```

**Purpose**: Synchronizes product data from POS to Business Central.

**Process**:
1. Calls `/api/v1/products` endpoint
2. Parses JSON response
3. Processes product data
4. Logs sync activity

**Returns**: Boolean - True if sync successful, False otherwise

##### SyncCustomers
```al
local procedure SyncCustomers(): Boolean
```

**Purpose**: Synchronizes customer data from POS to Business Central.

**Process**:
1. Calls `/api/v1/customers` endpoint
2. Parses JSON response
3. Processes customer data
4. Logs sync activity

**Returns**: Boolean - True if sync successful, False otherwise

##### SyncSalesOrders
```al
local procedure SyncSalesOrders(): Boolean
```

**Purpose**: Synchronizes sales order data from POS to Business Central.

**Process**:
1. Calls `/api/v1/sales-orders` endpoint
2. Parses JSON response
3. Processes sales order data
4. Logs sync activity

**Returns**: Boolean - True if sync successful, False otherwise

##### GetLatestPOSOrder
```al
local procedure GetLatestPOSOrder(var OrderData: JsonObject): Boolean
```

**Purpose**: Retrieves the latest sales order from POS system.

**Parameters**:
- `OrderData` (JsonObject): Output parameter containing order data

**Returns**: Boolean - True if order data retrieved successfully

**API Call**: `GET /api/v1/sales-orders?limit=1&sort=createdAt:desc`

##### CreateSalesOrder
```al
local procedure CreateSalesOrder(OrderData: JsonObject; var SalesHeader: Record "Sales Header"): Boolean
```

**Purpose**: Creates a sales order in Business Central from POS data.

**Parameters**:
- `OrderData` (JsonObject): POS order data
- `SalesHeader` (Record "Sales Header"): Output parameter containing created sales order

**Returns**: Boolean - True if sales order created successfully

##### ExtractOrderData
```al
local procedure ExtractOrderData(OrderData: JsonObject; var OrderNo: Text; var CustomerNo: Code[20]; var CustomerName: Text; var LocationCode: Code[10]): Boolean
```

**Purpose**: Extracts order information from JSON data.

**Parameters**:
- `OrderData` (JsonObject): POS order data
- `OrderNo` (Text): Output parameter for order number
- `CustomerNo` (Code[20]): Output parameter for customer number
- `CustomerName` (Text): Output parameter for customer name
- `LocationCode` (Code[10]): Output parameter for location code

**Returns**: Boolean - True if data extracted successfully

##### GetNextSalesOrderNo
```al
local procedure GetNextSalesOrderNo(): Code[20]
```

**Purpose**: Gets the next available sales order number.

**Returns**: Code[20] - Next sales order number

##### AddSalesLines
```al
local procedure AddSalesLines(var SalesHeader: Record "Sales Header"; OrderData: JsonObject): Boolean
```

**Purpose**: Adds sales lines to a sales order from POS data.

**Parameters**:
- `SalesHeader` (Record "Sales Header"): Sales order header
- `OrderData` (JsonObject): POS order data containing line items

**Returns**: Boolean - True if lines added successfully

##### ProcessProductData
```al
local procedure ProcessProductData(ProductData: JsonArray): Boolean
```

**Purpose**: Processes product data from POS and creates/updates items in Business Central.

**Parameters**:
- `ProductData` (JsonArray): Array of product data from POS

**Returns**: Boolean - True if processing successful

##### ProcessCustomerData
```al
local procedure ProcessCustomerData(CustomerData: JsonArray): Boolean
```

**Purpose**: Processes customer data from POS and creates/updates customers in Business Central.

**Parameters**:
- `CustomerData` (JsonArray): Array of customer data from POS

**Returns**: Boolean - True if processing successful

##### ProcessSalesOrderData
```al
local procedure ProcessSalesOrderData(OrderData: JsonArray): Boolean
```

**Purpose**: Processes sales order data from POS and creates sales orders in Business Central.

**Parameters**:
- `OrderData` (JsonArray): Array of sales order data from POS

**Returns**: Boolean - True if processing successful

##### UpdateSyncStatistics
```al
local procedure UpdateSyncStatistics(Success: Boolean)
```

**Purpose**: Updates synchronization statistics in the setup table.

**Parameters**:
- `Success` (Boolean): Whether the sync was successful

##### LogSyncActivity
```al
local procedure LogSyncActivity(SyncType: Option "Sales Order",Product,Customer,Manual,Automatic; Status: Option Success,Error,Warning,Info; Message: Text; Details: Text)
```

**Purpose**: Logs synchronization activities to the sync log table.

**Parameters**:
- `SyncType` (Option): Type of synchronization
- `Status` (Option): Status of the activity
- `Message` (Text): Log message
- `Details` (Text): Additional details

## Table Reference

### POS Integration Setup (50100)

#### Fields

| Field Name | Type | Length | Description |
|------------|------|--------|-------------|
| Primary Key | Code | 10 | Primary key for the setup record |
| Integration Enabled | Boolean | - | Master switch for integration |
| Auto Create Sales Orders | Boolean | - | Auto-create sales orders from POS |
| Default Customer No. | Code | 20 | Default customer for POS orders |
| Default Location Code | Code | 10 | Default location for inventory |
| API Base URL | Text | 250 | Base URL for POS API |
| API Key | Text | 100 | Authentication key for API |
| API Timeout | Integer | - | Request timeout in seconds |
| Sync Interval | Integer | - | Automatic sync interval in minutes |
| Last Sync Date/Time | DateTime | - | Last successful sync timestamp |
| Sync Status | Option | - | Current sync status |
| Total Orders Synced | Integer | - | Count of successful syncs |
| Failed Syncs | Integer | - | Count of failed syncs |
| Success Rate | Decimal | - | Success rate percentage |
| Webhook URL | Text | 250 | Webhook endpoint URL |
| Webhook Enabled | Boolean | - | Enable webhook notifications |
| Retry Attempts | Integer | - | Number of retry attempts |
| Retry Delay (seconds) | Integer | - | Delay between retries |
| Log Level | Option | - | Logging detail level |
| Created Date/Time | DateTime | - | Record creation timestamp |
| Modified Date/Time | DateTime | - | Last modification timestamp |

#### Keys
- **Primary Key**: Clustered on "Primary Key"

#### Triggers
- **OnInsert**: Sets creation timestamp
- **OnModify**: Sets modification timestamp

### POS Sync Log (50101)

#### Fields

| Field Name | Type | Length | Description |
|------------|------|--------|-------------|
| Entry No. | Integer | - | Auto-incrementing entry number |
| Date/Time | DateTime | - | Activity timestamp |
| Sync Type | Option | - | Type of synchronization |
| Status | Option | - | Activity status |
| Message | Text | 500 | Log message |
| Details | Text | 1000 | Additional details |
| Record ID | RecordId | - | Related record ID |
| User ID | Code | 50 | User who performed action |
| Duration (ms) | Integer | - | Activity duration |
| Retry Count | Integer | - | Number of retry attempts |
| API Response | Text | 1000 | API response data |
| Error Code | Text | 50 | Error code if applicable |
| Source System | Text | 50 | Source system identifier |
| Target System | Text | 50 | Target system identifier |

#### Keys
- **Primary Key**: Clustered on "Entry No."
- **DateTime**: On "Date/Time"
- **SyncType**: On "Sync Type", "Date/Time"
- **Status**: On "Status", "Date/Time"

#### Triggers
- **OnInsert**: Sets timestamp and user ID

## Page Reference

### BC POS Integration (50100)

#### Page Type
- **Type**: Card
- **Source Table**: POS Integration Setup
- **Usage**: Administration

#### Layout Sections

##### General Group
- Integration Enabled
- Auto Create Sales Orders
- Default Customer No.
- Default Location Code

##### API Settings Group
- API Base URL
- API Key
- API Timeout

##### Sync Settings Group
- Sync Interval
- Last Sync Date/Time
- Sync Status

##### Statistics Group
- Total Orders Synced
- Failed Syncs
- Success Rate

#### Actions

##### Processing Actions
- **Test Connection**: Tests API connectivity
- **Manual Sync**: Triggers manual synchronization
- **Create Sales Order**: Creates sales order from POS
- **View Sync Log**: Opens sync log page

### POS Sync Log (50101)

#### Page Type
- **Type**: List
- **Source Table**: POS Sync Log
- **Usage**: Lists
- **Editable**: False

#### Layout Fields
- Entry No.
- Date/Time
- Sync Type
- Status
- Message
- User ID
- Duration (ms)
- Retry Count

#### Actions

##### Processing Actions
- **Clear Log**: Removes old log entries
- **Export Log**: Exports log to CSV
- **Refresh**: Refreshes the display

##### Navigation Actions
- **Setup**: Opens POS Integration Setup

## Data Structures

### JSON Data Formats

#### Product Data
```json
{
  "id": "PROD001",
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "category": "Electronics",
  "sku": "SKU123456"
}
```

#### Customer Data
```json
{
  "id": "CUST001",
  "number": "C00001",
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zip": "12345"
  }
}
```

#### Sales Order Data
```json
{
  "id": "ORDER001",
  "customer": {
    "number": "C00001",
    "name": "Customer Name"
  },
  "items": [
    {
      "itemNo": "ITEM001",
      "description": "Item description",
      "quantity": 2,
      "unitPrice": 19.99
    }
  ],
  "total": 39.98,
  "createdAt": "2024-01-01T10:00:00Z"
}
```

## Error Handling

### Error Codes

| Error Code | Description | Resolution |
|------------|-------------|------------|
| CONNECTION_FAILED | API connection failed | Check network and API URL |
| AUTH_FAILED | Authentication failed | Verify API key |
| TIMEOUT | Request timeout | Increase timeout setting |
| INVALID_DATA | Invalid data format | Check data structure |
| CUSTOMER_NOT_FOUND | Customer does not exist | Create customer in BC |
| LOCATION_NOT_FOUND | Location does not exist | Create location in BC |

### Error Logging
All errors are logged with:
- Error code
- Detailed message
- Stack trace (if available)
- API response (if applicable)
- Timestamp and user information

## Performance Considerations

### API Optimization
- Use appropriate timeout values
- Implement retry logic for transient failures
- Batch processing for large datasets
- Connection pooling for multiple requests

### Database Optimization
- Index on frequently queried fields
- Regular log cleanup
- Partition large log tables
- Monitor query performance

### Memory Management
- Dispose of HTTP objects properly
- Limit JSON object size
- Use streaming for large responses
- Monitor memory usage during sync 