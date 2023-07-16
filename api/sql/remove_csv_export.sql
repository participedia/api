UPDATE csv_export
SET 
is_deleted = true
WHERE 
csvid = ${csvExportId};