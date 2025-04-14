SELECT
  CASE
    WHEN TRIM(scope_of_influence) = '' OR scope_of_influence IS NULL THEN 'uncategorized'
    ELSE scope_of_influence
  END AS scope_of_influence,
  COUNT(*) AS count
FROM cases
GROUP BY scope_of_influence
ORDER BY count DESC;
