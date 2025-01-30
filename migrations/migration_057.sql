CREATE MATERIALIZED VIEW search_index_pt AS

WITH allauthors AS (
  SELECT
    things.id thingid,
    string_agg(users.name, ' ') authorstring
  FROM users, authors, things
  WHERE
   authors.user_id = users.id AND
   authors.thingid = things.id
  GROUP BY things.id
), texts AS (
SELECT DISTINCT ON(thingid) thingid, title, body, description
 FROM (
   SELECT DISTINCT ON(thingid, timestamp) thingid, title, body, description
   FROM localized_texts
   WHERE language = 'pt'
   ORDER BY thingid, timestamp DESC
 ) as titles
 ORDER BY thingid
)
SELECT
   cases.id,
   cases.type,
   texts.title,
   texts.body,
   texts.description,
   setweight(to_tsvector('portuguese'::regconfig, texts.title), 'A') ||
   setweight(to_tsvector('portuguese'::regconfig, COALESCE(texts.body, '')), 'D') ||
   setweight(to_tsvector('portuguese'::regconfig, COALESCE(texts.description, '')), 'C')
   AS document
 FROM
   cases
 JOIN texts ON texts.thingid = cases.id
 JOIN allauthors ON allauthors.thingid = cases.id
 WHERE
   cases.hidden = false
UNION
SELECT
   methods.id,
   methods.type,
   texts.title,
   texts.body,
   texts.description,
   setweight(to_tsvector('portuguese'::regconfig, texts.title), 'A') ||
   setweight(to_tsvector('portuguese'::regconfig, COALESCE(texts.body, '')), 'D') ||
   setweight(to_tsvector('portuguese'::regconfig, COALESCE(texts.description, '')), 'C')
   AS document
 FROM
   methods
 JOIN texts ON texts.thingid = methods.id
 JOIN allauthors ON allauthors.thingid = methods.id
 WHERE
   methods.hidden = false
UNION
SELECT
   organizations.id,
   organizations.type,
   texts.title,
   texts.body,
   texts.description,
   setweight(to_tsvector('portuguese'::regconfig, texts.title), 'A') ||
   setweight(to_tsvector('portuguese'::regconfig, texts.body), 'D') ||
   setweight(to_tsvector('portuguese'::regconfig, texts.description), 'C')
   AS document
 FROM
   organizations
 JOIN texts ON texts.thingid = organizations.id
 JOIN allauthors ON allauthors.thingid = organizations.id
 WHERE
   organizations.hidden = false
;

CREATE INDEX idx_fts_search_pt ON search_index_pt USING gin(document);

-- CREATE FUNCTION update_search() RETURNS trigger
--   LANGUAGE sql STABLE
--   AS $_$
--   REFRESH MATERIALIZED VIEW search_index_en;
-- $_$;
--
-- create trigger search_insert after insert on things
--     for each statement execute procedure update_search();
--
-- create trigger search_update after update on things
--     for each statement execute procedure update_search();
