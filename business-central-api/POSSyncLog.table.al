table 50101 "POS Sync Log"
{
    Caption = 'POS Sync Log';
    DataClassification = CustomerContent;

    fields
    {
        field(1; "Entry No."; Integer)
        {
            Caption = 'Entry No.';
            DataClassification = CustomerContent;
            AutoIncrement = true;
        }

        field(2; "Date/Time"; DateTime)
        {
            Caption = 'Date/Time';
            DataClassification = CustomerContent;
        }

        field(3; "Sync Type"; Option)
        {
            Caption = 'Sync Type';
            OptionCaption = 'Sales Order,Product,Customer,Manual,Automatic';
            OptionMembers = "Sales Order",Product,Customer,Manual,Automatic;
            DataClassification = CustomerContent;
        }

        field(4; "Status"; Option)
        {
            Caption = 'Status';
            OptionCaption = 'Success,Error,Warning,Info';
            OptionMembers = Success,Error,Warning,Info;
            DataClassification = CustomerContent;
        }

        field(5; "Message"; Text[500])
        {
            Caption = 'Message';
            DataClassification = CustomerContent;
        }

        field(6; "Details"; Text[1000])
        {
            Caption = 'Details';
            DataClassification = CustomerContent;
        }

        field(7; "Record ID"; RecordId)
        {
            Caption = 'Record ID';
            DataClassification = CustomerContent;
        }

        field(8; "User ID"; Code[50])
        {
            Caption = 'User ID';
            DataClassification = CustomerContent;
        }

        field(9; "Duration (ms)"; Integer)
        {
            Caption = 'Duration (ms)';
            DataClassification = CustomerContent;
        }

        field(10; "Retry Count"; Integer)
        {
            Caption = 'Retry Count';
            DataClassification = CustomerContent;
        }

        field(11; "API Response"; Text[1000])
        {
            Caption = 'API Response';
            DataClassification = CustomerContent;
        }

        field(12; "Error Code"; Text[50])
        {
            Caption = 'Error Code';
            DataClassification = CustomerContent;
        }

        field(13; "Source System"; Text[50])
        {
            Caption = 'Source System';
            DataClassification = CustomerContent;
        }

        field(14; "Target System"; Text[50])
        {
            Caption = 'Target System';
            DataClassification = CustomerContent;
        }
    }

    keys
    {
        key(PK; "Entry No.")
        {
            Clustered = true;
        }
        key(DateTime; "Date/Time")
        {
        }
        key(SyncType; "Sync Type", "Date/Time")
        {
        }
        key(Status; Status, "Date/Time")
        {
        }
    }

    trigger OnInsert()
    begin
        "Date/Time" := CurrentDateTime;
        "User ID" := UserId;
    end;
}