page 50102 "POS Sync Log Entry"
{
    PageType = Card;
    SourceTable = "POS Sync Log";
    Caption = 'POS Sync Log Entry';
    Editable = false;
    InsertAllowed = false;
    DeleteAllowed = false;
    ModifyAllowed = false;

    layout
    {
        area(Content)
        {
            group(General)
            {
                field("Entry No."; Rec."Entry No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the entry number.';
                }
                field("Date/Time"; Rec."Date/Time")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the date and time of the sync activity.';
                }
                field("Sync Type"; Rec."Sync Type")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the type of synchronization.';
                }
                field("Status"; Rec."Status")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the status of the sync activity.';
                }
                field("Message"; Rec."Message")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the message for the sync activity.';
                    MultiLine = true;
                }
                field("Details"; Rec."Details")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies additional details about the sync activity.';
                    MultiLine = true;
                }
                field("User ID"; Rec."User ID")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the user who performed the sync activity.';
                }
                field("Duration (ms)"; Rec."Duration (ms)")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the duration of the sync activity in milliseconds.';
                }
                field("Retry Count"; Rec."Retry Count")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the number of retry attempts.';
                }
            }
        }
    }
}