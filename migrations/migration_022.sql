CREATE TABLE related_nouns (
  type_1 text NOT NULL,
  id_1 INTEGER NOT NULL,
  type_2 text NOT NULL,
  id_2 INTEGER NOT NULL,
  CONSTRAINT sorted CHECK(concat(type_1, id_1::text) < concat(type_2, id_2::text))
);

-- port starter relations from migration_013
INSERT INTO related_nouns (type_1, id_1, type_2, id_2)
VALUES
  ('case', 37, 'case', 45),
  ('case', 37, 'case', 63),
  ('case', 38, 'case', 70),
  ('case', 37, 'method', 145),
  ('case', 37, 'method', 163),
  ('case', 38, 'method', 170),
  ('case', 37, 'organization', 245),
  ('case', 37, 'organization', 263),
  ('case', 38, 'organization', 270),

  ('case', 52, 'method', 161),
  ('case', 47, 'method', 161),
  ('case', 65, 'method', 162),
  ('method', 152, 'method', 161),
  ('method', 147, 'method', 161),
  ('method', 162, 'method', 165),
  ('method', 161, 'organization', 252),
  ('method', 161, 'organization', 247),
  ('method', 162, 'organization', 265),

  ('case', 47, 'organization', 270),
  ('case', 55, 'organization', 270),
  ('case', 66, 'organization', 269),
  ('method', 147, 'organization', 270),
  ('method', 155, 'organization', 270),
  ('method', 166, 'organization', 269),
  ('organization', 247, 'organization', 270),
  ('organization', 255, 'organization', 270),
  ('organization', 266, 'organization', 269)
;

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

CREATE OR REPLACE FUNCTION get_case_reference(id INTEGER)
RETURNS object_reference AS
$$
SELECT
    ROW(id, 'case', title, lead_image, post_date, updated_date)::object_reference
  FROM
    case__localized_texts,
    cases
  WHERE
    case_id = $1 AND
    language = 'en' AND
    id = $1
$$
LANGUAGE 'sql' STABLE;

CREATE OR REPLACE FUNCTION get_method_reference(id INTEGER)
RETURNS object_reference AS
$$
SELECT
    ROW(id, 'method', title, lead_image, post_date, updated_date)::object_reference
  FROM
    method__localized_texts,
    methods
  WHERE
    method_id = $1 AND
    language = 'en' AND
    id = $1
$$
LANGUAGE 'sql' STABLE;

CREATE OR REPLACE FUNCTION get_organization_reference(id INTEGER)
RETURNS object_reference AS
$$
SELECT
    ROW(id, 'organization', title, lead_image, post_date, updated_date)::object_reference
  FROM
    organization__localized_texts,
    organizations
  WHERE
    organization_id = $1 AND
    language = 'en' AND
    id = $1
$$
LANGUAGE 'sql' STABLE;

-- One method to pick the right specific function defined above
CREATE OR REPLACE FUNCTION get_noun_reference(type TEXT, id INTEGER)
RETURNS object_reference AS
$$
SELECT CASE WHEN $1 = 'case' THEN get_case_reference($2)
            WHEN $1 = 'method' THEN get_method_reference($2)
            WHEN $1 = 'organization' THEN get_organization_reference($2)
       END
AS reference
$$
LANGUAGE 'sql' STABLE;

-- Get all related nouns as a table
CREATE OR REPLACE FUNCTION related_nouns_of_type_for_type(related_type text, source_type text, source_id INTEGER)
RETURNS TABLE (reference object_reference) AS
$$
SELECT get_noun_reference(type_2, id_2)
FROM related_nouns
WHERE type_1 = $2 AND
    id_1 = $3 AND
    type_2 = $1
UNION
SELECT get_noun_reference(type_1, id_1)
FROM related_nouns
WHERE type_1 = $1 AND
    id_2 = $3 AND
    type_2 = $2
$$
LANGUAGE 'sql' STABLE;

-- Get all related nouns as an array
CREATE OR REPLACE FUNCTION get_related_nouns(related_type text, source_type text, source_id INTEGER)
RETURNS object_reference[] AS
$$
SELECT ARRAY(SELECT ROW(rel.*)::object_reference FROM related_nouns_of_type_for_type($1, $2, $3) rel);
$$
LANGUAGE 'sql' STABLE;
