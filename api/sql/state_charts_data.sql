WITH base AS (
  SELECT
    ${scopeExpr:raw}  AS scope_values,
    ${issueExpr:raw}  AS issue_values,
    ${methodExpr:raw} AS method_values
  FROM ${table:name}
  WHERE published = true
    AND hidden = false
    ${facets:raw}
),
exploded AS (
  SELECT
    scope_value,
    issue_value,
    method_value
  FROM base
  CROSS JOIN LATERAL UNNEST(scope_values)  AS scope_vals(scope_value)
  CROSS JOIN LATERAL UNNEST(issue_values)  AS issue_vals(issue_value)
  CROSS JOIN LATERAL UNNEST(method_values) AS method_vals(method_value)
)
SELECT
  COALESCE(NULLIF(scope_value, ''), 'uncategorized') AS scope_of_influence,
  COALESCE(NULLIF(issue_value, ''), 'uncategorized') AS issue_key,
  COALESCE(NULLIF(method_value, ''), 'uncategorized') AS method_type_key,
  COUNT(*)::text AS count
FROM exploded
GROUP BY scope_of_influence, issue_key, method_type_key
ORDER BY scope_of_influence, count DESC;
