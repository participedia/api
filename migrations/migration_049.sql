-- CREATE Collections table
CREATE TABLE collections (
  title text DEFAULT ''::text,
  description text,
  body text,
  bookmarked boolean
)
INHERITS (things);

-- DROP existing MATERIALIZED VIEW
DROP MATERIALIZED VIEW IF EXISTS search_index_en RESTRICT;

-- CREATE new MATERIALIZED VIEW
CREATE MATERIALIZED VIEW search_index_en
AS
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
   setweight(to_tsvector('english'::regconfig, COALESCE(texts.body, '')), 'D') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(texts.description, '')), 'C') ||
   setweight(to_tsvector('english'::regconfig, keylist_to_text('en', 'tags', cases.tags)), 'A') ||
   setweight(to_tsvector('english'::regconfig, allauthors.authorstring), 'A') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.city, '')), 'A') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(cases.country, '')), 'A') ||
   setweight(to_tsvector('english'::regconfig,
   COALESCE(cases.funder, '')), 'D') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'general_issues', cases.general_issues)), 'B') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'specific_topics', cases.specific_topics)), 'B') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'purposes', cases.purposes)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'approaches', cases.approaches)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'targeted_participants', cases.targeted_participants)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'method_types', cases.method_types)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'participants_interactions', cases.participants_interactions)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'learning_resources', cases.learning_resources)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'decision_methods', cases.decision_methods)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'if_voting', cases.if_voting)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'insights_outcomes', cases.insights_outcomes)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'organizer_types', cases.organizer_types)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'funder_types', cases.funder_types)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'change_types', cases.change_types)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'implementers_of_change', cases.implementers_of_change)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'tools_techniques_types', cases.tools_techniques_types)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'scope_of_influence', cases.scope_of_influence)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'public_spectrum', cases.public_spectrum)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'legality', cases.legality)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'facilitators', cases.facilitators)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'facilitator_training', cases.facilitator_training)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'facetoface_online_or_both', cases.facetoface_online_or_both)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'open_limited', cases.open_limited)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'recruitment_method', cases.recruitment_method)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'time_limited', cases.time_limited)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(cases.links)), 'D') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(cases.videos)), 'D') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(cases.audio)), 'D') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(cases.evaluation_links)), 'D') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(cases.photos)), 'D') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(cases.files)), 'D') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(cases.evaluation_reports)), 'D')
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
   setweight(to_tsvector('english'::regconfig, COALESCE(texts.body, '')), 'D') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(texts.description, '')), 'C') ||
   setweight(to_tsvector('english'::regconfig, allauthors.authorstring), 'A') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'method_types', methods.method_types)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'scope_of_influence', methods.scope_of_influence)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'participants_interactions', methods.participants_interactions)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'number_of_participants', methods.number_of_participants)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'decision_methods', methods.decision_methods)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'if_voting', methods.if_voting)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'facetoface_online_or_both', methods.facetoface_online_or_both)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'public_spectrum', methods.public_spectrum)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'open_limited', methods.open_limited)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'recruitment_method', methods.recruitment_method)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'level_polarization', methods.level_polarization)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'level_complexity', methods.level_polarization)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(methods.links)), 'D') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(methods.videos)), 'D') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(methods.audio)), 'D') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(methods.photos)), 'D') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(methods.files)), 'D')
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
   setweight(to_tsvector('english'::regconfig, allauthors.authorstring), 'A') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(organizations.city, '')), 'A') ||
   setweight(to_tsvector('english'::regconfig, COALESCE(organizations.country, '')), 'A') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'scope_of_influence', organizations.scope_of_influence)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'type_method', organizations.type_method)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'type_tool', organizations.type_tool)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'specific_topics', organizations.specific_topics)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   keylist_to_text('en', 'general_issues', organizations.general_issues)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   value_key_to_text('en', 'sector', organizations.sector)), 'C') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(organizations.links)), 'D') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(organizations.videos)), 'D') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(organizations.audio)), 'D') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(organizations.photos)), 'D') ||
   setweight(to_tsvector('english'::regconfig,
   medialist_to_text(organizations.files)), 'D')
   AS document
 FROM
   organizations
 JOIN texts ON texts.thingid = organizations.id
 JOIN allauthors ON allauthors.thingid = organizations.id
 WHERE
   organizations.hidden = false
UNION
SELECT
   collections.id,
   collections.type,
   texts.title,
   texts.body,
   texts.description,
   setweight(to_tsvector('english'::regconfig, texts.title), 'A') ||
   setweight(to_tsvector('english'::regconfig, texts.body), 'D') ||
   setweight(to_tsvector('english'::regconfig, texts.description), 'C')
   AS document
 FROM
   collections
 JOIN texts ON texts.thingid = collections.id
 WHERE
  collections.hidden = false
;

CREATE INDEX idx_fts_search_en ON search_index_en USING gin(document);