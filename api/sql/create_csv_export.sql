INSERT into csv_export (
  csvid,
  requested_timestamp,
  type,
  created_at,
  created_by,
  updated_at,
  updated_by,
  is_deleted
)
VALUES
  (
    ${csvExportId},
    'now',
    ${type},
    'now',
    ${userId},
    'now',
    ${userId},
    false
  )
RETURNING csvid as csv_export_id;
