SELECT
  issue,
  COUNT(*) AS count
FROM (
  -- For records that have non-null general_issues, unnest each element.
  SELECT unnest(general_issues) AS issue
  FROM cases
  WHERE general_issues IS NOT NULL
  
  UNION ALL
  
  -- For records where general_issues is null, assign 'uncategorized'
  SELECT 'uncategorized' AS issue
  FROM cases
  WHERE general_issues IS NULL
) AS ungrouped_issues
GROUP BY issue
ORDER BY count DESC;
