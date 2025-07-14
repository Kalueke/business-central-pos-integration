page 50101 "POS Sync Log"
{
    PageType = List;
    ApplicationArea = All;
    UsageCategory = Lists;
    Caption = 'POS Sync Log';
    SourceTable = "POS Sync Log";
    CardPageId = "POS Sync Log Entry";
    Editable = false;

    layout
    {
        area(Content)
        {
            repeater(GroupName)
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

    actions
    {
        area(Processing)
        {
            action(ClearLog)
            {
                ApplicationArea = All;
                Caption = 'Clear Log';
                ToolTip = 'Clear all log entries older than the specified days.';
                Image = ClearLog;

                trigger OnAction()
                begin
                    ClearLogEntries();
                end;
            }

            action(ExportLog)
            {
                ApplicationArea = All;
                Caption = 'Export Log';
                ToolTip = 'Export the sync log to a file.';
                Image = Export;

                trigger OnAction()
                begin
                    ExportLogToFile();
                end;
            }

            action(Refresh)
            {
                ApplicationArea = All;
                Caption = 'Refresh';
                ToolTip = 'Refresh the log entries.';
                Image = Refresh;

                trigger OnAction()
                begin
                    CurrPage.Update();
                end;
            }
        }

        area(Navigation)
        {
            action(Setup)
            {
                ApplicationArea = All;
                Caption = 'Setup';
                ToolTip = 'Open the POS Integration Setup page.';
                Image = Setup;
                RunObject = Page "BC POS Integration";
            }
        }
    }

    local procedure ClearLogEntries()
    var
        POSSyncLog: Record "POS Sync Log";
        DaysToKeep: Integer;
    begin
        DaysToKeep := 30; // Default to 30 days

        if Dialog.Confirm('Clear log entries older than %1 days?', false, DaysToKeep) then begin
            POSSyncLog.SetRange("Date/Time", 0DT, CurrentDateTime - (DaysToKeep * 24 * 60 * 60 * 1000));
            if POSSyncLog.FindSet() then begin
                POSSyncLog.DeleteAll();
                Message('Log entries cleared successfully.');
            end else
                Message('No log entries to clear.');
        end;
    end;

    local procedure ExportLogToFile()
    var
        POSSyncLog: Record "POS Sync Log";
        TempBlob: Codeunit "Temp Blob";
        OutStream: OutStream;
        InStream: InStream;
        FileName: Text;
        Line: Text;
    begin
        FileName := 'POS_Sync_Log_' + Format(Today, 0, '<Year4><Month,2><Day,2>') + '.csv';

        TempBlob.CreateOutStream(OutStream);

        // Write header
        Line := 'Entry No.,Date/Time,Sync Type,Status,Message,User ID,Duration (ms),Retry Count,Error Code';
        OutStream.WriteText(Line);
        OutStream.WriteText();

        // Write data
        if POSSyncLog.FindSet() then
            repeat
                Line := Format(POSSyncLog."Entry No.") + ',' +
                        Format(POSSyncLog."Date/Time") + ',' +
                        Format(POSSyncLog."Sync Type") + ',' +
                        Format(POSSyncLog."Status") + ',' +
                        POSSyncLog."Message" + ',' +
                        POSSyncLog."User ID" + ',' +
                        Format(POSSyncLog."Duration (ms)") + ',' +
                        Format(POSSyncLog."Retry Count") + ',' +
                        POSSyncLog."Error Code";
                OutStream.WriteText(Line);
                OutStream.WriteText();
            until POSSyncLog.Next() = 0;

        TempBlob.CreateInStream(InStream);
        DownloadFromStream(InStream, 'Export', '', 'CSV Files (*.csv)|*.csv', FileName);
    end;
}