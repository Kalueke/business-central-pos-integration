table 50100 "POS Integration Setup"
{
    Caption = 'POS Integration Setup';
    DataClassification = CustomerContent;

    fields
    {
        field(1; "Primary Key"; Code[10])
        {
            Caption = 'Primary Key';
            DataClassification = CustomerContent;
        }

        field(2; "Integration Enabled"; Boolean)
        {
            Caption = 'Integration Enabled';
            DataClassification = CustomerContent;
        }

        field(3; "Auto Create Sales Orders"; Boolean)
        {
            Caption = 'Auto Create Sales Orders';
            DataClassification = CustomerContent;
        }

        field(4; "Default Customer No."; Code[20])
        {
            Caption = 'Default Customer No.';
            TableRelation = Customer;
            DataClassification = CustomerContent;
        }

        field(5; "Default Location Code"; Code[10])
        {
            Caption = 'Default Location Code';
            TableRelation = Location;
            DataClassification = CustomerContent;
        }

        field(6; "API Base URL"; Text[250])
        {
            Caption = 'API Base URL';
            DataClassification = CustomerContent;
        }

        field(7; "API Key"; Text[100])
        {
            Caption = 'API Key';
            DataClassification = CustomerContent;
        }

        field(8; "API Timeout"; Integer)
        {
            Caption = 'API Timeout (seconds)';
            DataClassification = CustomerContent;
            InitValue = 30;
        }

        field(9; "Sync Interval"; Integer)
        {
            Caption = 'Sync Interval (minutes)';
            DataClassification = CustomerContent;
            InitValue = 15;
        }

        field(10; "Last Sync Date/Time"; DateTime)
        {
            Caption = 'Last Sync Date/Time';
            DataClassification = CustomerContent;
        }

        field(11; "Sync Status"; Option)
        {
            Caption = 'Sync Status';
            OptionCaption = 'Not Started,In Progress,Completed,Failed';
            OptionMembers = "Not Started","In Progress","Completed","Failed";
            DataClassification = CustomerContent;
        }

        field(12; "Total Orders Synced"; Integer)
        {
            Caption = 'Total Orders Synced';
            DataClassification = CustomerContent;
        }

        field(13; "Failed Syncs"; Integer)
        {
            Caption = 'Failed Syncs';
            DataClassification = CustomerContent;
        }

        field(14; "Success Rate"; Decimal)
        {
            Caption = 'Success Rate (%)';
            DataClassification = CustomerContent;
            DecimalPlaces = 2 : 2;
        }

        field(15; "Webhook URL"; Text[250])
        {
            Caption = 'Webhook URL';
            DataClassification = CustomerContent;
        }

        field(16; "Webhook Enabled"; Boolean)
        {
            Caption = 'Webhook Enabled';
            DataClassification = CustomerContent;
        }

        field(17; "Retry Attempts"; Integer)
        {
            Caption = 'Retry Attempts';
            DataClassification = CustomerContent;
            InitValue = 3;
        }

        field(18; "Retry Delay (seconds)"; Integer)
        {
            Caption = 'Retry Delay (seconds)';
            DataClassification = CustomerContent;
            InitValue = 60;
        }

        field(19; "Log Level"; Option)
        {
            Caption = 'Log Level';
            OptionCaption = 'Error,Warning,Info,Debug';
            OptionMembers = Error,Warning,Info,Debug;
            DataClassification = CustomerContent;
            InitValue = Info;
        }

        field(20; "Created Date/Time"; DateTime)
        {
            Caption = 'Created Date/Time';
            DataClassification = CustomerContent;
        }

        field(21; "Modified Date/Time"; DateTime)
        {
            Caption = 'Modified Date/Time';
            DataClassification = CustomerContent;
        }
    }

    keys
    {
        key(PK; "Primary Key")
        {
            Clustered = true;
        }
    }

    trigger OnInsert()
    begin
        "Created Date/Time" := CurrentDateTime;
        "Modified Date/Time" := CurrentDateTime;
    end;

    trigger OnModify()
    begin
        "Modified Date/Time" := CurrentDateTime;
    end;
}