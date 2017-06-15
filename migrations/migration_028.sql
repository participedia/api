-- Fix instances of "null" vs. null

UPDATE cases SET specific_topic = NULL WHERE specific_topic = 'null';
UPDATE cases SET issue = NULL WHERE issue = 'null';
UPDATE organization SET issue = NULL WHERE issue = 'null';


 -- Modify Materialized view and index for English searches

DROP MATERIALIZED VIEW search_index_en;

 CREATE MATERIALIZED VIEW search_index_en AS

 WITH allauthors AS (
   SELECT
     things.id thingid,
     string_agg(users.name, ' ') authorstring
   FROM users, authors, things
   WHERE
    authors.user_id = users.id AND
    authors.thingid = things.id
   GROUP BY things.id
),
alltags as (
  SELECT
	thingid,
	COALESCE(string_agg(tags, ' '), '') tagstring
  FROM
  	(SELECT things.id thingid, unnest(things.tags) tags FROM things) subtags
  GROUP BY
  	thingid
)

SELECT
		things.id,
    things.type,
    things.location,
    localized_texts.title,
    localized_texts.body,
    things.lead_image,
    things.updated_date,
    setweight(to_tsvector('english'::regconfig, localized_texts.title), 'A') ||
    setweight(to_tsvector('english'::regconfig, localized_texts.body), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(alltags.tagstring, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, allauthors.authorstring), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE((things.location).city, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE((things.location).country, '')), 'A') AS document
	FROM
		things
  JOIN localized_texts ON localized_texts.thingid = things.id
  JOIN allauthors ON allauthors.thingid = things.id
  LEFT JOIN alltags ON alltags.thingid = things.id
	WHERE
		localized_texts.language = 'en' -- this is the english search view
;

CREATE INDEX idx_fts_search_en ON search_index_en USING gin(document);
