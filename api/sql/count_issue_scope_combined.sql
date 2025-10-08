WITH exploded AS (
  SELECT
    COALESCE(NULLIF(scope_of_influence, ''), 'uncategorized') AS scope_of_influence,
    gi AS issue,
    mt AS method_type
  FROM cases
  CROSS JOIN LATERAL UNNEST(
    CASE
      WHEN general_issues IS NULL OR CARDINALITY(general_issues) = 0
        THEN ARRAY['uncategorized']::text[]
      ELSE general_issues
    END
  ) AS gi(gi)
  CROSS JOIN LATERAL UNNEST(
    CASE
      WHEN method_types IS NULL OR CARDINALITY(method_types) = 0
        THEN ARRAY['uncategorized']::text[]
      ELSE method_types
    END
  ) AS mt(mt)
  WHERE published = true
    AND hidden = false
    ${facets:raw}
)
SELECT
  scope_of_influence,
  issue,
  method_type,
  COUNT(*)::text AS count
FROM exploded
GROUP BY scope_of_influence, issue, method_type
ORDER BY scope_of_influence, count DESC;