CREATE TABLE related_nouns (
  type_1 text NOT NULL,
  id_1 INTEGER NOT NULL,
  type_2 text NOT NULL,
  id_2 INTEGER NOT NULL,
  CONSTRAINT sorted CHECK(concat(type_1, id_1::text) < concat(type_2, id_2::text))
);

DROP TABLE case__related_cases;
DROP TABLE case__related_methods;
DROP TABLE case__related_organizations;
DROP TABLE method__related_cases;
DROP TABLE method__related_methods;
DROP TABLE method__related_organizations;
DROP TABLE organization__related_cases;
DROP TABLE organization__related_methods;
DROP TABLE organization__related_organizations;

-- START MOVING RE-USABLE BITS INTO FUNCTIONS

-- A little repetitive, maybe move these into JavaScript using V8

CREATE OR REPLACE FUNCTION get_case_reference(id INTEGER, language TEXT)
RETURNS object_reference AS
$$
SELECT
    ROW(id, 'case', title, lead_image, post_date, updated_date)::object_reference
  FROM
    case__localized_texts,
    cases
  WHERE
    case_id = $1 AND
    language = $2 AND
    id = $1
$$
LANGUAGE 'sql' STABLE;

CREATE OR REPLACE FUNCTION get_method_reference(id INTEGER, langauge TEXT)
RETURNS object_reference AS
$$
SELECT
    ROW(id, 'method', title, lead_image, post_date, updated_date)::object_reference
  FROM
    method__localized_texts,
    methods
  WHERE
    method_id = $1 AND
    language = $2 AND
    id = $1
$$
LANGUAGE 'sql' STABLE;

CREATE OR REPLACE FUNCTION get_organization_reference(id INTEGER, language TEXT)
RETURNS object_reference AS
$$
SELECT
    ROW(id, 'organization', title, lead_image, post_date, updated_date)::object_reference
  FROM
    organization__localized_texts,
    organizations
  WHERE
    organization_id = $1 AND
    language = $2 AND
    id = $1
$$
LANGUAGE 'sql' STABLE;

-- One method to pick the right specific function defined above
CREATE OR REPLACE FUNCTION get_noun_reference(type TEXT, id INTEGER, language TEXT)
RETURNS object_reference AS
$$
SELECT CASE WHEN $1 = 'case' THEN get_case_reference($2, $3)
            WHEN $1 = 'method' THEN get_method_reference($2, $3)
            WHEN $1 = 'organization' THEN get_organization_reference($2, $3)
       END
AS reference
$$
LANGUAGE 'sql' STABLE;

-- Get all related nouns as a table
CREATE OR REPLACE FUNCTION related_nouns_of_type_for_type(related_type TEXT, source_type TEXT, source_id INTEGER, language TEXT)
RETURNS TABLE (reference object_reference) AS
$$
SELECT get_noun_reference(type_2, id_2, $4)
FROM related_nouns
WHERE type_1 = $2 AND
    id_1 = $3 AND
    type_2 = $1
UNION
SELECT get_noun_reference(type_1, id_1, $4)
FROM related_nouns
WHERE type_1 = $1 AND
    id_2 = $3 AND
    type_2 = $2
$$
LANGUAGE 'sql' STABLE;

-- Get all related nouns as an array
CREATE OR REPLACE FUNCTION get_related_nouns(related_type TEXT, source_type TEXT, source_id INTEGER, language TEXT)
RETURNS object_reference[] AS
$$
SELECT ARRAY(SELECT ROW(rel.*)::object_reference FROM related_nouns_of_type_for_type($1, $2, $3, $4) rel);
$$
LANGUAGE 'sql' STABLE;
