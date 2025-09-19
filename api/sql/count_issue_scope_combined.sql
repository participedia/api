-- one row per (scope_of_influence, issue, method_type)
WITH exploded AS (
  SELECT
    COALESCE(NULLIF(scope_of_influence, ''), 'uncategorized') AS scope_of_influence,
    gi AS issue,
    mt AS method_type
  FROM cases
  -- explode general_issues (or 'uncategorized' if null/empty)
  CROSS JOIN LATERAL UNNEST(
    CASE
      WHEN general_issues IS NULL OR CARDINALITY(general_issues) = 0
        THEN ARRAY['uncategorized']::text[]
      ELSE general_issues
    END
  ) AS gi
  -- explode method_types (or 'uncategorized' if null/empty)
  CROSS JOIN LATERAL UNNEST(
    CASE
      WHEN method_types IS NULL OR CARDINALITY(method_types) = 0
        THEN ARRAY['uncategorized']::text[]
      ELSE method_types
    END
  ) AS mt
)
SELECT
  scope_of_influence,
  issue,
  method_type,
  COUNT(*)::text AS count
FROM exploded
GROUP BY scope_of_influence, issue, method_type
ORDER BY scope_of_influence, count DESC;
