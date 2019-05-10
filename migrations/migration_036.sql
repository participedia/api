DROP FUNCTION get_object_short(integer, text);
DROP TYPE object_short;

CREATE TYPE object_short AS (
	id integer,
	title text,
	type text,
	photos full_file{},
	post_date timestamp,
	updated_date timestamp
);

-- FIXME: Split the materialized view into smaller functions like the below
-- CREATE FUNCTION get_all_authors() RETURNS TABLE(thingid int, authorstring text)
--     LANGUAGE sql STABLE
--     AS $_$
--   SELECT
--     things.id thingid,
--     string_agg(users.name, ' ') authorstring
--   FROM users, authors, things
--   WHERE
--    authors.user_id = users.id AND
--    authors.thingid = things.id
--   GROUP BY things.id
-- $_$;


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
), texts AS (
select distinct on(thingid) thingid, title, body, description
 from (
   select distinct on(thingid, timestamp) thingid, title, body, description
   from localized_texts
   where language = 'en'
   order by thingid, timestamp DESC
 ) as titles
 order by thingid
)

SELECT
   cases.id,
   cases.type,
   texts.title,
   texts.body,
   texts.description,
   setweight(to_tsvector('english'::regconfig, texts.title), 'A') ||
   setweight(to_tsvector('english'::regconfig, texts.body), 'D') ||
   setweight(to_tsvector('english'::regconfig, texts.description), 'C') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.tags, '{}'::text[]), ' ')), 'A') ||
   setweight(to_tsvector('english'::regconfig, allauthors.authorstring), 'A') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.city, '')), 'A') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.country, '')), 'A') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.relationships, '{}'::text[]), '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.issues, '{}'::text[]), '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.specific_topics, '{}'::text[]), '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.scope_of_influence, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.time_limited, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.purposes, '{}'::text[]), '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.approaches, '{}'::text[]), '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.public_spectrum, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.open_limited, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.recruitment_method, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.targeted_participants, '{}'::text[]), '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.legality, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.facilitators, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.facilitator_training, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.facetoface_online_or_both, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.participants_interactions, '{}'::text[]), '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.learning_resources, '{}'::text[]), '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.decision_methods, '{}'::text[]), '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.if_voting, '{}'::text[]), '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.insights_outcomes, '{}'::text[]), '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.organizer_types, '{}'::text[]), '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.funder, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.funder_types, '{}'::text[]), '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.impact_evidence, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.change_types,  '{}'::text[]), '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.implementers_of_change, '{}'::text[]), '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.formal_evaluation, ''::text)), 'B')
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
   setweight(to_tsvector('english'::regconfig, texts.title), 'A') ||
   setweight(to_tsvector('english'::regconfig, texts.body), 'D') ||
   setweight(to_tsvector('english'::regconfig, texts.description), 'C') ||
   setweight(to_tsvector('english'::regconfig, allauthors.authorstring), 'A') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(methods.geographical_scope, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(methods.participant_selections, '{}'::text[]), ' ')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(methods.recruitment_method, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(methods.communication_modes, '{}'::text[]), ' ')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(methods.decision_method, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(methods.if_voting, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(methods.public_interaction_methods, '{}'::text[]), ' ')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(methods.issue_polarization, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(methods.issue_technical_complexity, '')), 'B') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(methods.issue_interdependency, '')), 'B')
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
   setweight(to_tsvector('english'::regconfig, texts.title), 'A') ||
   setweight(to_tsvector('english'::regconfig, texts.body), 'D') ||
   setweight(to_tsvector('english'::regconfig, texts.description), 'C') ||
   setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(organizations.tags, '{}'::text[]), ' ')), 'A') ||
   setweight(to_tsvector('english'::regconfig, allauthors.authorstring), 'A') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(organizations.city, '')), 'A') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(organizations.country, '')), 'A') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(organizations.executive_director, '')), 'A')
   AS document
 FROM
   organizations
 JOIN texts ON texts.thingid = organizations.id
 JOIN allauthors ON allauthors.thingid = organizations.id
 WHERE
   organizations.hidden = false
;

CREATE INDEX idx_fts_search_en ON search_index_en USING gin(document);
