page 50100 "BC POS Integration"
{
    PageType = Card;
    ApplicationArea = All;
    UsageCategory = Administration;
    Caption = 'BC POS Integration';

    layout
    {
        area(Content)
        {
            group(General)
            {
                Caption = 'General';

                field(IntegrationEnabled; IntegrationEnabled)
                {
                    ApplicationArea = All;
                    Caption = 'Integration Enabled';
                    ToolTip = 'Specifies if the POS integration is enabled.';
                }

                field(AutoCreateSalesOrders; AutoCreateSalesOrders)
                {
                    ApplicationArea = All;
                    Caption = 'Auto Create Sales Orders';
                    ToolTip = 'Specifies if sales orders should be automatically created from POS data.';
                }

                field(DefaultCustomerNo; DefaultCustomerNo)
                {
                    ApplicationArea = All;
                    Caption = 'Default Customer No.';
                    TableRelation = Customer;
                    ToolTip = 'Specifies the default customer number for POS sales orders.';
                }

                field(DefaultLocationCode; DefaultLocationCode)
                {
                    ApplicationArea = All;
                    Caption = 'Default Location Code';
                    TableRelation = Location;
                    ToolTip = 'Specifies the default location code for POS sales orders.';
                }
            }

            group(API_Settings)
            {
                Caption = 'API Settings';

                field(APIBaseURL; APIBaseURL)
                {
                    ApplicationArea = All;
                    Caption = 'API Base URL';
                    ToolTip = 'Specifies the base URL for the POS API.';
                }

                field(APIKey; APIKey)
                {
                    ApplicationArea = All;
                    Caption = 'API Key';
                    ToolTip = 'Specifies the API key for authentication.';
                    ExtendedDatatype = Masked;
                }

                field(APITimeout; APITimeout)
                {
                    ApplicationArea = All;
                    Caption = 'API Timeout (seconds)';
                    ToolTip = 'Specifies the timeout for API requests in seconds.';
                }
            }

            group(Sync_Settings)
            {
                Caption = 'Sync Settings';

                field(SyncInterval; SyncInterval)
                {
                    ApplicationArea = All;
                    Caption = 'Sync Interval (minutes)';
                    ToolTip = 'Specifies the interval for automatic synchronization in minutes.';
                }

                field(LastSyncDateTime; LastSyncDateTime)
                {
                    ApplicationArea = All;
                    Caption = 'Last Sync Date/Time';
                    ToolTip = 'Specifies when the last synchronization occurred.';
                    Editable = false;
                }

                field(SyncStatus; SyncStatus)
                {
                    ApplicationArea = All;
                    Caption = 'Sync Status';
                    ToolTip = 'Specifies the current synchronization status.';
                    Editable = false;
                }
            }

            group(Statistics)
            {
                Caption = 'Statistics';

                field(TotalOrdersSynced; TotalOrdersSynced)
                {
                    ApplicationArea = All;
                    Caption = 'Total Orders Synced';
                    ToolTip = 'Specifies the total number of orders synced from POS.';
                    Editable = false;
                }

                field(FailedSyncs; FailedSyncs)
                {
                    ApplicationArea = All;
                    Caption = 'Failed Syncs';
                    ToolTip = 'Specifies the number of failed synchronization attempts.';
                    Editable = false;
                }

                field(SuccessRate; SuccessRate)
                {
                    ApplicationArea = All;
                    Caption = 'Success Rate (%)';
                    ToolTip = 'Specifies the success rate of synchronization.';
                    Editable = false;
                }
            }
        }
    }

    actions
    {
        area(Processing)
        {
            action(TestConnection)
            {
                ApplicationArea = All;
                Caption = 'Test Connection';
                ToolTip = 'Test the connection to the POS API.';
                Image = TestDatabase;

                trigger OnAction()
                begin
                    TestPOSConnection();
                end;
            }

            action(ManualSync)
            {
                ApplicationArea = All;
                Caption = 'Manual Sync';
                ToolTip = 'Manually trigger synchronization with POS.';
                Image = Refresh;

                trigger OnAction()
                begin
                    ManualSync();
                end;
            }

            action(CreateSalesOrder)
            {
                ApplicationArea = All;
                Caption = 'Create Sales Order';
                ToolTip = 'Create a new sales order from POS data.';
                Image = NewDocument;

                trigger OnAction()
                begin
                    CreateSalesOrderFromPOS();
                end;
            }

            action(ViewSyncLog)
            {
                ApplicationArea = All;
                Caption = 'View Sync Log';
                ToolTip = 'View the synchronization log.';
                Image = Log;

                trigger OnAction()
                begin
                    ViewSyncLog();
                end;
            }
        }
    }

    var
        IntegrationEnabled: Boolean;
        AutoCreateSalesOrders: Boolean;
        DefaultCustomerNo: Code[20];
        DefaultLocationCode: Code[10];
        APIBaseURL: Text[250];
        APIKey: Text[100];
        APITimeout: Integer;
        SyncInterval: Integer;
        LastSyncDateTime: DateTime;
        SyncStatus: Option "Not Started","In Progress","Completed","Failed";
        TotalOrdersSynced: Integer;
        FailedSyncs: Integer;
        SuccessRate: Decimal;

    local procedure TestPOSConnection()
    var
        POSIntegrationMgt: Codeunit "POS Integration Mgt.";
        Result: Boolean;
    begin
        if APIBaseURL = '' then begin
            Message('Please enter the API Base URL first.');
            exit;
        end;

        Result := POSIntegrationMgt.TestConnection(APIBaseURL, APIKey, APITimeout);

        if Result then
            Message('Connection test successful!')
        else
            Message('Connection test failed. Please check your settings.');
    end;

    local procedure ManualSync()
    var
        POSIntegrationMgt: Codeunit "POS Integration Mgt.";
    begin
        if not IntegrationEnabled then begin
            Message('Integration is not enabled. Please enable it first.');
            exit;
        end;

        SyncStatus := SyncStatus::"In Progress";
        CurrPage.Update();

        if POSIntegrationMgt.SyncFromPOS() then begin
            SyncStatus := SyncStatus::Completed;
            LastSyncDateTime := CurrentDateTime;
            Message('Synchronization completed successfully.');
        end else begin
            SyncStatus := SyncStatus::Failed;
            Message('Synchronization failed. Check the sync log for details.');
        end;

        CurrPage.Update();
    end;

    local procedure CreateSalesOrderFromPOS()
    var
        POSIntegrationMgt: Codeunit "POS Integration Mgt.";
        SalesOrder: Record "Sales Header";
    begin
        if not IntegrationEnabled then begin
            Message('Integration is not enabled. Please enable it first.');
            exit;
        end;

        if POSIntegrationMgt.CreateSalesOrderFromPOS(SalesOrder) then
            Message('Sales order created successfully.')
        else
            Message('Failed to create sales order. Check the sync log for details.');
    end;

    local procedure ViewSyncLog()
    var
        POSSyncLog: Page "POS Sync Log";
    begin
        POSSyncLog.Run();
    end;
}