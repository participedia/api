INSERT into csv_export (
  csvid,
  requested_timestamp,
  type,
  created_at,
  created_by,
  updated_at,
  updated_by
)
VALUES
  (
    ${csvExportId},
    'now',
    ${type},
    'now',
    ${userId},
    'now',
    ${userId}
  )
RETURNING csvid as csv_export_id;
