WITH total_cases AS (
  SELECT count(id) AS total
  FROM things th
  WHERE
    th.type = 'case' AND th.hidden = false AND
    (EXISTS (SELECT 1 FROM cases c WHERE c.id = th.id ${facets:raw}))
),
total_methods AS (
  SELECT count(id) AS total
  FROM things th
  WHERE
    th.type = 'method' AND th.hidden = false AND
    (EXISTS (SELECT 1 FROM methods m WHERE m.id = th.id ${facets:raw}))
),
total_organizations AS (
  SELECT count(id) AS total
  FROM things th
  WHERE
    th.type = 'organization' AND th.hidden = false AND
    (EXISTS (SELECT 1 FROM organizations o WHERE o.id = th.id ${facets:raw}))
)

SELECT row_to_json(results.*) as results from (
SELECT
  total_cases.total as total_cases,
  total_methods.total as total_methods,
  total_organizations.total as total_organizations
FROM
  total_cases,
  total_methods,
  total_organizations
) AS results;