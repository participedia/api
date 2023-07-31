UPDATE csv_export
SET 
is_deleted = true,
updated_at = 'now',
updated_by = ${user_id}
WHERE 
csvid = ${csvExportId};