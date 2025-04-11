SELECT
  issue,
  COUNT(*) AS count
FROM (
  SELECT unnest(general_issues) AS issue
  FROM cases
) AS ungrouped_issues
GROUP BY issue
ORDER BY count DESC;
