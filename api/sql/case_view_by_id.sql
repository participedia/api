SELECT
  row_to_json(get_case_view_by_id(${articleid}, ${lang}, ${userid}))
AS
  results
;
