-- Turn bookmarked into a function

-- One method to pick the right specific function defined above
CREATE OR REPLACE FUNCTION bookmarked(type TEXT, thingId INTEGER, userId INTEGER)
RETURNS BOOLEAN AS
$$
SELECT CASE
  WHEN EXISTS
  (
    SELECT 1
    FROM bookmarks
    WHERE bookmarktype = $1
      AND thingid = $2
      AND userid = $3
  )
  THEN true
  ELSE false
END
$$
LANGUAGE 'sql' STABLE;


 -- Modify Materialized view and index for English searches

DROP MATERIALIZED VIEW search_index_en;

 CREATE MATERIALIZED VIEW search_index_en AS

 WITH case_authors AS (
   SELECT cases.id case_id, string_agg(users.name, ' ') authors
   FROM users, case__authors, cases
   WHERE
    case__authors.user_id = users.id AND
    case__authors.case_id = cases.id
   GROUP BY cases.id
),
method_authors as (
   SELECT methods.id method_id, string_agg(users.name, ' ') authors
   FROM users, method__authors, methods
   WHERE
    method__authors.user_id = users.id AND
    method__authors.method_id = methods.id
   GROUP BY methods.id
),
organization_authors as (
   SELECT organizations.id organization_id, string_agg(users.name, ' ') authors
   FROM users, organization__authors, organizations
   WHERE
    organization__authors.user_id = users.id AND
    organization__authors.organization_id = organizations.id
   GROUP BY organizations.id
),
case_tags as (
  SELECT
	case_id,
	string_agg(tags, ' ') tags
  FROM
  	(SELECT cases.id case_id, unnest(cases.tags) tags FROM cases) subtags
  GROUP BY
  	case_id
),
method_tags as (
  SELECT
	method_id,
	string_agg(tags, ' ') tags
  FROM
  	(SELECT methods.id method_id, unnest(methods.tags) tags FROM methods) subtags
  GROUP BY
  	method_id
),
organization_tags as (
  SELECT
	organization_id,
	string_agg(tags, ' ') tags
  FROM
  	(SELECT organizations.id organization_id, unnest(organizations.tags) tags FROM organizations) subcase
  GROUP BY
  	organization_id
)

SELECT
		cases.id,
		TEXT 'case' AS type,
		case__localized_texts.title,
    case__localized_texts.body,
		cases.lead_image,
		cases.updated_date,
    setweight(to_tsvector('english'::regconfig, case__localized_texts.title), 'A') ||
    setweight(to_tsvector('english'::regconfig, case__localized_texts.body), 'B') ||
    setweight(to_tsvector('english'::regconfig, case_tags.tags), 'C') ||
    setweight(to_tsvector('english'::regconfig, case_authors.authors), 'D') AS document
	FROM
		cases
  JOIN case__localized_texts ON case__localized_texts.case_id = cases.id
  JOIN case_authors ON case_authors.case_id = cases.id
  JOIN case_tags ON case_tags.case_id = cases.id
	WHERE
		case__localized_texts.language = 'en'
UNION
	SELECT
		methods.id,
		TEXT 'method' AS type,
		method__localized_texts.title,
    method__localized_texts.body,
		methods.lead_image,
		methods.updated_date,
    setweight(to_tsvector('english'::regconfig, method__localized_texts.title), 'A') ||
    setweight(to_tsvector('english'::regconfig, method__localized_texts.body), 'B') ||
    setweight(to_tsvector('english'::regconfig, method_tags.tags), 'C') ||
    setweight(to_tsvector('english'::regconfig, method_authors.authors), 'D') AS document
	FROM
		methods
	JOIN method__localized_texts ON method__localized_texts.method_id = methods.id
  JOIN method_authors ON method_authors.method_id = methods.id
  JOIN method_tags ON method_tags.method_id = methods.id
	WHERE
		method__localized_texts.language = 'en'
UNION
	SELECT
		organizations.id,
		TEXT 'organization' AS type,
		organization__localized_texts.title,
    organization__localized_texts.body,
		organizations.lead_image,
		organizations.updated_date,
    setweight(to_tsvector('english'::regconfig, organization__localized_texts.title), 'A') ||
    setweight(to_tsvector('english'::regconfig, organization__localized_texts.body), 'B') ||
    setweight(to_tsvector('english'::regconfig, organization_tags.tags), 'C') ||
    setweight(to_tsvector('english'::regconfig, organization_authors.authors), 'D') AS document
	FROM
		organizations
	JOIN organization__localized_texts ON organization__localized_texts.organization_id = organizations.id
  JOIN organization_authors ON organization_authors.organization_id = organizations.id
  JOIN organization_tags ON organization_tags.organization_id = organizations.id
	WHERE
		organization__localized_texts.language = 'en'
;

DROP INDEX IF EXISTS idx_fts_search_en;
CREATE INDEX idx_fts_search_en ON search_index_en USING gin(document);
