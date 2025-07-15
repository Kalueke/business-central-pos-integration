codeunit 50100 "POS Integration Mgt."
{
    var
        POSSetup: Record "POS Integration Setup";
        POSSyncLog: Record "POS Sync Log";
        StartTime: DateTime;
        EndTime: DateTime;

    local procedure GetPOSSetup(): Boolean
    begin
        if not POSSetup.Get('DEFAULT') then begin
            POSSetup.Init();
            POSSetup."Primary Key" := 'DEFAULT';
            POSSetup.Insert();
        end;
        exit(true);
    end;

    local procedure LogSyncActivity(SyncType: Option "Sales Order",Product,Customer,Manual,Automatic; Status: Option Success,Error,Warning,Info; Message: Text; Details: Text)
    begin
        POSSyncLog.Init();
        POSSyncLog."Sync Type" := SyncType;
        POSSyncLog.Status := Status;
        POSSyncLog.Message := CopyStr(Message, 1, MaxStrLen(POSSyncLog.Message));
        POSSyncLog.Details := CopyStr(Details, 1, MaxStrLen(POSSyncLog.Details));
        POSSyncLog."Duration (ms)" := Round((EndTime - StartTime) * 86400000, 1);
        POSSyncLog."Source System" := 'POS';
        POSSyncLog."Target System" := 'Business Central';
        POSSyncLog.Insert();
    end;

    local procedure CallAPI(Method: Text; URL: Text; APIKey: Text; Timeout: Integer; RequestBody: Text; var ResponseBody: Text): Boolean
    var
        HttpClient: HttpClient;
        HttpRequestMessage: HttpRequestMessage;
        HttpResponseMessage: HttpResponseMessage;
        HttpContent: HttpContent;
        HttpHeaders: HttpHeaders;
        Success: Boolean;
    begin
        HttpRequestMessage.Method := Method;
        HttpRequestMessage.SetRequestUri(URL);
        Success := HttpRequestMessage.GetHeaders(HttpHeaders);
        if not Success then
            exit(false);

        HttpHeaders.Add('Content-Type', 'application/json');
        if APIKey <> '' then
            HttpHeaders.Add('Authorization', 'Bearer ' + APIKey);

        HttpClient.Timeout(Timeout * 1000);

        if RequestBody <> '' then begin
            HttpContent.WriteFrom(RequestBody);
            HttpRequestMessage.Content := HttpContent;
        end;

        Success := HttpClient.Send(HttpRequestMessage, HttpResponseMessage);

        if Success then begin
            Success := HttpResponseMessage.Content().ReadAs(ResponseBody);
            if Success then
                Success := HttpResponseMessage.IsSuccessStatusCode();
        end;

        exit(Success);
    end;

    local procedure GetNextSalesOrderNo(): Code[20]
    var
        NoSeries: Codeunit "No. Series";
        SalesSetup: Record "Sales & Receivables Setup";
    begin
        SalesSetup.Get();
        exit(NoSeries.GetNextNo(SalesSetup."Order Nos.", Today));
    end;

    procedure TestConnection(APIBaseURL: Text; APIKey: Text; Timeout: Integer): Boolean
    var
        Success: Boolean;
        DurationMs: Integer;
        ResponseText: Text;
    begin
        StartTime := CurrentDateTime;
        Success := CallAPI('GET', APIBaseURL + '/api/v1/health', APIKey, Timeout, '', ResponseText);

        if Success then
            LogSyncActivity(POSSyncLog."Sync Type"::Manual, POSSyncLog.Status::Success, 'Connection test successful', '')
        else
            LogSyncActivity(POSSyncLog."Sync Type"::Manual, POSSyncLog.Status::Error, 'Connection test failed', ResponseText);

        EndTime := CurrentDateTime;
        DurationMs := Round((EndTime - StartTime) * 86400000, 1);
        LogSyncActivity(POSSyncLog."Sync Type"::Manual, POSSyncLog.Status::Info,
            StrSubstNo('Connection test completed in %1 ms', DurationMs), '');
        exit(Success);
    end;

    local procedure SyncProducts(): Boolean
    var
        ProductData: JsonArray;
        Success: Boolean;
        ResponseText: Text;
    begin
        Success := false;
        if CallAPI('GET', POSSetup."API Base URL" + '/api/v1/products', POSSetup."API Key", POSSetup."API Timeout", '', ResponseText) then begin
            if ProductData.ReadFrom(ResponseText) then begin
                Success := ProcessProductData(ProductData);
                if Success then
                    LogSyncActivity(POSSyncLog."Sync Type"::Product, POSSyncLog.Status::Success, 'Product sync completed successfully', ResponseText)
                else
                    LogSyncActivity(POSSyncLog."Sync Type"::Product, POSSyncLog.Status::Error, 'Product sync failed', ResponseText);
            end else
                LogSyncActivity(POSSyncLog."Sync Type"::Product, POSSyncLog.Status::Error, 'Invalid product data format', ResponseText);
        end else
            LogSyncActivity(POSSyncLog."Sync Type"::Product, POSSyncLog.Status::Error, 'Failed to fetch products from POS', ResponseText);
        exit(Success);
    end;

    local procedure SyncCustomers(): Boolean
    var
        CustomerData: JsonArray;
        Success: Boolean;
        ResponseText: Text;
    begin
        Success := false;
        if CallAPI('GET', POSSetup."API Base URL" + '/api/v1/customers', POSSetup."API Key", POSSetup."API Timeout", '', ResponseText) then begin
            if CustomerData.ReadFrom(ResponseText) then begin
                Success := ProcessCustomerData(CustomerData);
                if Success then
                    LogSyncActivity(POSSyncLog."Sync Type"::Customer, POSSyncLog.Status::Success, 'Customer sync completed successfully', ResponseText)
                else
                    LogSyncActivity(POSSyncLog."Sync Type"::Customer, POSSyncLog.Status::Error, 'Customer sync failed', ResponseText);
            end else
                LogSyncActivity(POSSyncLog."Sync Type"::Customer, POSSyncLog.Status::Error, 'Invalid customer data format', ResponseText);
        end else
            LogSyncActivity(POSSyncLog."Sync Type"::Customer, POSSyncLog.Status::Error, 'Failed to fetch customers from POS', ResponseText);
        exit(Success);
    end;

    local procedure SyncSalesOrders(): Boolean
    var
        OrderData: JsonArray;
        Success: Boolean;
        ResponseText: Text;
    begin
        Success := false;
        if CallAPI('GET', POSSetup."API Base URL" + '/api/v1/sales-orders', POSSetup."API Key", POSSetup."API Timeout", '', ResponseText) then begin
            if OrderData.ReadFrom(ResponseText) then begin
                Success := ProcessSalesOrderData(OrderData);
                if Success then
                    LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Success, 'Sales order sync completed successfully', ResponseText)
                else
                    LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Error, 'Sales order sync failed', ResponseText);
            end else
                LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Error, 'Invalid sales order data format', ResponseText);
        end else
            LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Error, 'Failed to fetch sales orders from POS', ResponseText);
        exit(Success);
    end;

    procedure SyncFromPOS(): Boolean
    var
        Success: Boolean;
        DurationMs: Integer;
    begin
        if not GetPOSSetup() then
            exit(false);

        if not POSSetup."Integration Enabled" then begin
            LogSyncActivity(POSSyncLog."Sync Type"::Manual, POSSyncLog.Status::Warning, 'Integration is not enabled', '');
            exit(false);
        end;

        StartTime := CurrentDateTime;
        Success := SyncProducts() and SyncCustomers() and SyncSalesOrders();
        EndTime := CurrentDateTime;

        UpdateSyncStatistics(Success);
        DurationMs := Round((EndTime - StartTime) * 86400000, 1);

        if Success then
            LogSyncActivity(POSSyncLog."Sync Type"::Manual, POSSyncLog.Status::Success,
                StrSubstNo('Synchronization completed successfully in %1 ms', DurationMs), '')
        else
            LogSyncActivity(POSSyncLog."Sync Type"::Manual, POSSyncLog.Status::Error,
                StrSubstNo('Synchronization failed in %1 ms', DurationMs), '');

        exit(Success);
    end;

    procedure CreateSalesOrderFromPOS(var SalesHeader: Record "Sales Header"): Boolean
    var
        Success: Boolean;
        POSOrderData: JsonObject;
        DurationMs: Integer;
        ResponseText: Text;
    begin
        if not GetPOSSetup() then
            exit(false);

        if not POSSetup."Integration Enabled" then begin
            LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Warning, 'Integration is not enabled', '');
            exit(false);
        end;

        StartTime := CurrentDateTime;
        Success := false;

        if GetLatestPOSOrder(POSOrderData) then begin
            if CreateSalesOrder(POSOrderData, SalesHeader) then begin
                Success := true;
                LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Success,
                    StrSubstNo('Sales order %1 created successfully', SalesHeader."No."), '');
            end else
                LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Error,
                    'Failed to create sales order', '');
        end else
            LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Error,
                'No POS order data available', '');

        EndTime := CurrentDateTime;
        DurationMs := Round((EndTime - StartTime) * 86400000, 1);

        if Success then
            LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Success,
                StrSubstNo('Sales order creation completed in %1 ms', DurationMs), '')
        else
            LogSyncActivity(POSSyncLog."Sync Type"::"Sales Order", POSSyncLog.Status::Error,
                StrSubstNo('Sales order creation failed in %1 ms', DurationMs), '');

        exit(Success);
    end;

    local procedure CreateSalesOrder(OrderData: JsonObject; var SalesHeader: Record "Sales Header"): Boolean
    var
        Success: Boolean;
        CustomerNo: Code[20];
        CustomerName: Text;
        LocationCode: Code[10];
        OrderNo: Text;
    begin
        if not ExtractOrderData(OrderData, OrderNo, CustomerNo, CustomerName, LocationCode) then
            exit(false);

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

        if not AddSalesLines(SalesHeader, OrderData) then begin
            SalesHeader.Delete();
            exit(false);
        end;

        exit(true);
    end;

    local procedure ExtractOrderData(OrderData: JsonObject; var OrderNo: Text; var CustomerNo: Code[20]; var CustomerName: Text; var LocationCode: Code[10]): Boolean
    var
        Token: JsonToken;
    begin
        CustomerNo := '';
        CustomerName := '';
        LocationCode := POSSetup."Default Location Code";

        if not OrderData.Get('id', Token) then
            exit(false);
        OrderNo := Token.AsValue().AsText();

        if OrderData.Get('customer', Token) then begin
            if Token.AsObject().Get('number', Token) then
                CustomerNo := CopyStr(Token.AsValue().AsText(), 1, MaxStrLen(CustomerNo));
            if Token.AsObject().Get('name', Token) then
                CustomerName := Token.AsValue().AsText();
        end;

        exit(true);
    end;

    local procedure AddSalesLines(var SalesHeader: Record "Sales Header"; OrderData: JsonObject): Boolean
    var
        SalesLine: Record "Sales Line";
        LineNo: Integer;
        Token: JsonToken;
        LinesArray: JsonArray;
        LineObj: JsonObject;
        ItemNo: Code[20];
        Quantity: Decimal;
        UnitPrice: Decimal;
        Description: Text;
    begin
        LineNo := 10000;

        if OrderData.Get('items', Token) then begin
            LinesArray := Token.AsArray();
            foreach Token in LinesArray do begin
                LineObj := Token.AsObject();
                ItemNo := '';
                Quantity := 0;
                UnitPrice := 0;
                Description := '';

                if LineObj.Get('itemNo', Token) then
                    ItemNo := CopyStr(Token.AsValue().AsText(), 1, MaxStrLen(ItemNo));
                if LineObj.Get('quantity', Token) then
                    Quantity := Token.AsValue().AsDecimal();
                if LineObj.Get('unitPrice', Token) then
                    UnitPrice := Token.AsValue().AsDecimal();
                if LineObj.Get('description', Token) then
                    Description := Token.AsValue().AsText();

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
            exit(true);
        end;
        exit(false);
    end;

    local procedure ProcessProductData(ProductData: JsonArray): Boolean
    begin
        // Extend to process and create/update Item records as needed.
        exit(true);
    end;

    local procedure ProcessCustomerData(CustomerData: JsonArray): Boolean
    begin
        // Extend to process and create/update Customer records as needed.
        exit(true);
    end;

    local procedure ProcessSalesOrderData(OrderData: JsonArray): Boolean
    begin
        // Extend to loop through and create Sales Orders from OrderData.
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

        if (POSSetup."Total Orders Synced" + POSSetup."Failed Syncs") > 0 then
            POSSetup."Success Rate" := (POSSetup."Total Orders Synced" / (POSSetup."Total Orders Synced" + POSSetup."Failed Syncs")) * 100;

        POSSetup.Modify();
    end;

    local procedure GetLatestPOSOrder(var OrderData: JsonObject): Boolean
    var
        OrdersArray: JsonArray;
        Token: JsonToken;
        ResponseText: Text;
    begin
        if CallAPI('GET', POSSetup."API Base URL" + '/api/v1/sales-orders?limit=1&sort=createdAt:desc',
            POSSetup."API Key", POSSetup."API Timeout", '', ResponseText) then begin
            if OrdersArray.ReadFrom(ResponseText) and OrdersArray.Get(0, Token) then begin
                OrderData := Token.AsObject();
                exit(true);
            end;
        end;
        exit(false);
    end;

}
