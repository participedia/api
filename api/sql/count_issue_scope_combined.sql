-- returns one row per (issue, scope_of_influence) pair
WITH exploded AS (
  -- explode the array of general_issues (or “uncategorized” if null)
  SELECT
    COALESCE(NULLIF(scope_of_influence, ''), 'uncategorized') AS scope_of_influence,
    unnest(general_issues)                                AS issue
  FROM cases
  WHERE general_issues IS NOT NULL

  UNION ALL

  -- for cases without any general_issues
  SELECT
    COALESCE(NULLIF(scope_of_influence, ''), 'uncategorized') AS scope_of_influence,
    'uncategorized'                                           AS issue
  FROM cases
  WHERE general_issues IS NULL
)
SELECT
  scope_of_influence,
  issue,
  COUNT(*)::TEXT AS count
FROM exploded
GROUP BY scope_of_influence, issue
ORDER BY scope_of_influence, count DESC;
