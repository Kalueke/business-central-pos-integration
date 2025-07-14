codeunit 50100 "POS Integration Mgt."
{
    Caption = 'POS Integration Management';

    var
        POSSetup: Record "POS Integration Setup";
        POSSyncLog: Record "POS Sync Log";
        HttpClient: HttpClient;
        HttpRequestMessage: HttpRequestMessage;
        HttpResponseMessage: HttpResponseMessage;
        HttpContent: HttpContent;
        HttpHeaders: HttpHeaders;
        JsonObject: JsonObject;
        JsonArray: JsonArray;
        JsonToken: JsonToken;
        ResponseText: Text;
        RequestText: Text;
        StartTime: DateTime;
        EndTime: DateTime;

    procedure TestConnection(APIBaseURL: Text; APIKey: Text; Timeout: Integer): Boolean
    var
        Success: Boolean;
    begin
        StartTime := CurrentDateTime;

        try
            // Test connection by calling a simple endpoint
            if CallAPI('GET', APIBaseURL + '/api/v1/health', APIKey, Timeout, '', ResponseText) then begin
            Success := true;
            LogSyncActivity('Manual', POSSyncLog.Status::Success, 'Connection test successful', '');
        end else begin
            Success := false;
            LogSyncActivity('Manual', POSSyncLog.Status::Error, 'Connection test failed', ResponseText);
        end;
        except
            Success := false;
        LogSyncActivity('Manual', POSSyncLog.Status::Error, 'Connection test failed with exception', GetLastErrorText());
    end;
        
        EndTime := CurrentDateTime;
        LogSyncActivity('Manual', POSSyncLog.Status::Info, 
            StrSubstNo('Connection test completed in %1 ms', 
                Duration2Int(EndTime - StartTime) * 1000), '');
        
        exit(Success);
    end;
    
    procedure SyncFromPOS(): Boolean
    var
        Success: Boolean;
        SyncType: Option "Sales Order",Product,Customer,Manual,Automatic;
    begin
        if not GetPOSSetup() then
            exit(false);
        
        if not POSSetup."Integration Enabled" then begin
            LogSyncActivity(SyncType::Automatic, POSSyncLog.Status::Warning, 'Integration is not enabled', '');
            exit(false);
        end;
        
        StartTime := CurrentDateTime;
        Success := true;
        
        // Sync products
        if not SyncProducts() then
            Success := false;
        
        // Sync customers
        if not SyncCustomers() then
            Success := false;
        
        // Sync sales orders
        if not SyncSalesOrders() then
            Success := false;
        
        EndTime := CurrentDateTime;
        
        // Update setup statistics
        UpdateSyncStatistics(Success);
        
        LogSyncActivity(SyncType::Automatic, 
            if Success then POSSyncLog.Status::Success else POSSyncLog.Status::Error,
            StrSubstNo('Synchronization %1 completed in %2 ms', 
                if Success then 'successfully' else 'failed',
                Duration2Int(EndTime - StartTime) * 1000), '');
        
        exit(Success);
    end;
    
    procedure CreateSalesOrderFromPOS(var SalesHeader: Record "Sales Header"): Boolean
    var
        Success: Boolean;
        POSOrderData: JsonObject;
        CustomerNo: Code[20];
        LocationCode: Code[10];
    begin
        if not GetPOSSetup() then
            exit(false);
        
        if not POSSetup."Integration Enabled" then begin
            LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Warning, 'Integration is not enabled', '');
            exit(false);
        end;
        
        StartTime := CurrentDateTime;
        
        try
            // Get latest sales order from POS
            if GetLatestPOSOrder(POSOrderData) then begin
                // Create sales order in Business Central
                if CreateSalesOrder(POSOrderData, SalesHeader) then begin
                    Success := true;
                    LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Success, 
                        StrSubstNo('Sales order %1 created successfully', SalesHeader."No."), '');
                end else begin
                    Success := false;
                    LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Error, 
                        'Failed to create sales order', '');
                end;
            end else begin
                Success := false;
                LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Error, 
                    'No POS order data available', '');
            end;
        except
            Success := false;
            LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Error, 
                'Exception occurred while creating sales order', GetLastErrorText());
        end;
        
        EndTime := CurrentDateTime;
        LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Info, 
            StrSubstNo('Sales order creation %1 in %2 ms', 
                if Success then 'completed' else 'failed',
                Duration2Int(EndTime - StartTime) * 1000), '');
        
        exit(Success);
    end;
    
    local procedure GetPOSSetup(): Boolean
    begin
        if not POSSetup.Get('DEFAULT') then begin
            POSSetup.Init();
            POSSetup."Primary Key" := 'DEFAULT';
            POSSetup.Insert();
        end;
        exit(true);
    end;
    
    local procedure CallAPI(Method: Text; URL: Text; APIKey: Text; Timeout: Integer; RequestBody: Text; var ResponseBody: Text): Boolean
    var
        Success: Boolean;
    begin
        HttpRequestMessage.Method(Method);
        HttpRequestMessage.SetRequestUri(URL);
        
        // Set headers
        HttpRequestMessage.GetHeaders(HttpHeaders);
        HttpHeaders.Add('Content-Type', 'application/json');
        if APIKey <> '' then
            HttpHeaders.Add('Authorization', 'Bearer ' + APIKey);
        
        // Set timeout
        HttpClient.Timeout(Timeout * 1000);
        
        // Set request body if provided
        if RequestBody <> '' then begin
            HttpContent.WriteFrom(RequestBody);
            HttpRequestMessage.Content(HttpContent);
        end;
        
        // Send request
        Success := HttpClient.Send(HttpRequestMessage, HttpResponseMessage);
        
        if Success then begin
            HttpResponseMessage.Content().ReadAs(ResponseBody);
            Success := HttpResponseMessage.IsSuccessStatusCode();
        end;
        
        exit(Success);
    end;
    
    local procedure SyncProducts(): Boolean
    var
        Success: Boolean;
        ProductData: JsonArray;
    begin
        if CallAPI('GET', POSSetup."API Base URL" + '/api/v1/products', POSSetup."API Key", POSSetup."API Timeout", '', ResponseText) then begin
            if JsonArray.ReadFrom(ResponseText) then begin
                Success := ProcessProductData(ProductData);
                LogSyncActivity(POSSyncLog."Sync Type"::Product, 
                    if Success then POSSyncLog.Status::Success else POSSyncLog.Status::Error,
                    StrSubstNo('Product sync %1', if Success then 'completed' else 'failed'), ResponseText);
            end else begin
                Success := false;
                LogSyncActivity(POSSyncLog."Sync Type"::Product, POSSyncLog.Status::Error, 'Invalid product data format', ResponseText);
            end;
        end else begin
            Success := false;
            LogSyncActivity(POSSyncLog."Sync Type"::Product, POSSyncLog.Status::Error, 'Failed to fetch products from POS', ResponseText);
        end;
        
        exit(Success);
    end;
    
    local procedure SyncCustomers(): Boolean
    var
        Success: Boolean;
        CustomerData: JsonArray;
    begin
        if CallAPI('GET', POSSetup."API Base URL" + '/api/v1/customers', POSSetup."API Key", POSSetup."API Timeout", '', ResponseText) then begin
            if JsonArray.ReadFrom(ResponseText) then begin
                Success := ProcessCustomerData(CustomerData);
                LogSyncActivity(POSSyncLog."Sync Type"::Customer, 
                    if Success then POSSyncLog.Status::Success else POSSyncLog.Status::Error,
                    StrSubstNo('Customer sync %1', if Success then 'completed' else 'failed'), ResponseText);
            end else begin
                Success := false;
                LogSyncActivity(POSSyncLog."Sync Type"::Customer, POSSyncLog.Status::Error, 'Invalid customer data format', ResponseText);
            end;
        end else begin
            Success := false;
            LogSyncActivity(POSSyncLog."Sync Type"::Customer, POSSyncLog.Status::Error, 'Failed to fetch customers from POS', ResponseText);
        end;
        
        exit(Success);
    end;
    
    local procedure SyncSalesOrders(): Boolean
    var
        Success: Boolean;
        OrderData: JsonArray;
    begin
        if CallAPI('GET', POSSetup."API Base URL" + '/api/v1/sales-orders', POSSetup."API Key", POSSetup."API Timeout", '', ResponseText) then begin
            if JsonArray.ReadFrom(ResponseText) then begin
                Success := ProcessSalesOrderData(OrderData);
                LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", 
                    if Success then POSSyncLog.Status::Success else POSSyncLog.Status::Error,
                    StrSubstNo('Sales order sync %1', if Success then 'completed' else 'failed'), ResponseText);
            end else begin
                Success := false;
                LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Error, 'Invalid sales order data format', ResponseText);
            end;
        end else begin
            Success := false;
            LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Error, 'Failed to fetch sales orders from POS', ResponseText);
        end;
        
        exit(Success);
    end;
    
    local procedure GetLatestPOSOrder(var OrderData: JsonObject): Boolean
    var
        Success: Boolean;
        OrdersArray: JsonArray;
    begin
        if CallAPI('GET', POSSetup."API Base URL" + '/api/v1/sales-orders?limit=1&sort=createdAt:desc', 
            POSSetup."API Key", POSSetup."API Timeout", '', ResponseText) then begin
            if JsonArray.ReadFrom(ResponseText) then begin
                if JsonArray.Get(0, JsonToken) then begin
                    OrderData := JsonToken.AsObject();
                    Success := true;
                end else begin
                    Success := false;
                end;
            end else begin
                Success := false;
            end;
        end else begin
            Success := false;
        end;
        
        exit(Success);
    end;
    
    local procedure CreateSalesOrder(OrderData: JsonObject; var SalesHeader: Record "Sales Header"): Boolean
    var
        Success: Boolean;
        CustomerNo: Code[20];
        LocationCode: Code[10];
        OrderNo: Text;
        CustomerName: Text;
    begin
        // Extract order data from JSON
        if not ExtractOrderData(OrderData, OrderNo, CustomerNo, CustomerName, LocationCode) then
            exit(false);
        
        // Create sales header
        SalesHeader.Init();
        SalesHeader."Document Type" := SalesHeader."Document Type"::Order;
        SalesHeader."No." := GetNextSalesOrderNo();
        SalesHeader."Sell-to Customer No." := CustomerNo;
        SalesHeader."Sell-to Customer Name" := CopyStr(CustomerName, 1, MaxStrLen(SalesHeader."Sell-to Customer Name"));
        SalesHeader."Location Code" := LocationCode;
        SalesHeader."Posting Date" := Today;
        SalesHeader."Document Date" := Today;
        SalesHeader."External Document No." := OrderNo;
        SalesHeader.Insert(true);
        
        // Add sales lines (this would be implemented based on your specific requirements)
        if not AddSalesLines(SalesHeader, OrderData) then begin
            SalesHeader.Delete();
            exit(false);
        end;
        
        exit(true);
    end;
    
    local procedure ExtractOrderData(OrderData: JsonObject; var OrderNo: Text; var CustomerNo: Code[20]; var CustomerName: Text; var LocationCode: Code[10]): Boolean
    var
        JsonToken: JsonToken;
    begin
        // Extract order number
        if not OrderData.Get('id', JsonToken) then
            exit(false);
        OrderNo := JsonToken.AsValue().AsText();
        
        // Extract customer information
        if OrderData.Get('customer', JsonToken) then begin
            if JsonToken.AsObject().Get('number', JsonToken) then
                CustomerNo := CopyStr(JsonToken.AsValue().AsText(), 1, MaxStrLen(CustomerNo));
            if JsonToken.AsObject().Get('name', JsonToken) then
                CustomerName := JsonToken.AsValue().AsText();
        end;
        
        // Use default location if not specified
        LocationCode := POSSetup."Default Location Code";
        
        exit(true);
    end;
    
    local procedure GetNextSalesOrderNo(): Code[20]
    var
        NoSeriesMgt: Codeunit NoSeriesManagement;
        SalesSetup: Record "Sales & Receivables Setup";
    begin
        SalesSetup.Get();
        exit(NoSeriesMgt.GetNextNo(SalesSetup."Order Nos.", Today, true));
    end;
    
    local procedure AddSalesLines(var SalesHeader: Record "Sales Header"; OrderData: JsonObject): Boolean
    var
        SalesLine: Record "Sales Line";
        LineNo: Integer;
        JsonToken: JsonToken;
        LinesArray: JsonArray;
        LineObject: JsonObject;
        ItemNo: Code[20];
        Quantity: Decimal;
        UnitPrice: Decimal;
        Description: Text;
    begin
        LineNo := 10000;
        
        if OrderData.Get('items', JsonToken) then begin
            if JsonToken.AsArray().ReadFrom(JsonToken.AsValue().AsText()) then begin
                foreach JsonToken in LinesArray do begin
                    LineObject := JsonToken.AsObject();
                    
                    // Extract line data
                    if LineObject.Get('itemNo', JsonToken) then
                        ItemNo := CopyStr(JsonToken.AsValue().AsText(), 1, MaxStrLen(ItemNo));
                    if LineObject.Get('quantity', JsonToken) then
                        Quantity := JsonToken.AsValue().AsDecimal();
                    if LineObject.Get('unitPrice', JsonToken) then
                        UnitPrice := JsonToken.AsValue().AsDecimal();
                    if LineObject.Get('description', JsonToken) then
                        Description := JsonToken.AsValue().AsText();
                    
                    // Create sales line
                    SalesLine.Init();
                    SalesLine."Document Type" := SalesHeader."Document Type";
                    SalesLine."Document No." := SalesHeader."No.";
                    SalesLine."Line No." := LineNo;
                    SalesLine.Type := SalesLine.Type::Item;
                    SalesLine."No." := ItemNo;
                    SalesLine.Description := CopyStr(Description, 1, MaxStrLen(SalesLine.Description));
                    SalesLine.Quantity := Quantity;
                    SalesLine."Unit Price" := UnitPrice;
                    SalesLine.Insert();
                    
                    LineNo += 10000;
                end;
            end;
        end;
        
        exit(true);
    end;
    
    local procedure ProcessProductData(ProductData: JsonArray): Boolean
    begin
        // Implementation for processing product data
        // This would update or create items in Business Central
        exit(true);
    end;
    
    local procedure ProcessCustomerData(CustomerData: JsonArray): Boolean
    begin
        // Implementation for processing customer data
        // This would update or create customers in Business Central
        exit(true);
    end;
    
    local procedure ProcessSalesOrderData(OrderData: JsonArray): Boolean
    begin
        // Implementation for processing sales order data
        // This would create sales orders in Business Central
        exit(true);
    end;
    
    local procedure UpdateSyncStatistics(Success: Boolean)
    begin
        if Success then begin
            POSSetup."Total Orders Synced" += 1;
            POSSetup."Last Sync Date/Time" := CurrentDateTime;
            POSSetup."Sync Status" := POSSetup."Sync Status"::Completed;
        end else begin
            POSSetup."Failed Syncs" += 1;
            POSSetup."Sync Status" := POSSetup."Sync Status"::Failed;
        end;
        
        // Calculate success rate
        if (POSSetup."Total Orders Synced" + POSSetup."Failed Syncs") > 0 then
            POSSetup."Success Rate" := (POSSetup."Total Orders Synced" / (POSSetup."Total Orders Synced" + POSSetup."Failed Syncs")) * 100;
        
        POSSetup.Modify();
    end;
    
    local procedure LogSyncActivity(SyncType: Option "Sales Order",Product,Customer,Manual,Automatic; Status: Option Success,Error,Warning,Info; Message: Text; Details: Text)
    begin
        POSSyncLog.Init();
        POSSyncLog."Sync Type" := SyncType;
        POSSyncLog."Status" := Status;
        POSSyncLog."Message" := CopyStr(Message, 1, MaxStrLen(POSSyncLog."Message"));
        POSSyncLog."Details" := CopyStr(Details, 1, MaxStrLen(POSSyncLog."Details"));
        POSSyncLog."Duration (ms)" := Duration2Int(EndTime - StartTime) * 1000;
        POSSyncLog."Source System" := 'POS';
        POSSyncLog."Target System" := 'Business Central';
        POSSyncLog.Insert();
    end;
} 