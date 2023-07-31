UPDATE csv_export
SET 
finished_timestamp = 'now',
download_url = ${downloadUrl},
updated_at = 'now',
updated_by = ${userId}
WHERE 
csvid = ${csvExportId};