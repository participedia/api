CREATE TABLE things (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    original_language text DEFAULT ''::text,
    post_date TIMESTAMPTZ,
    published BOOLEAN,
    updated_date TIMESTAMPTZ,
    location geolocation DEFAULT '("","","","","","","","","")'::geolocation,
    lead_image attachment DEFAULT '("","",0)'::attachment,
    other_images attachment[] DEFAULT '{}'::attachment[],
    files attachment[] DEFAULT '{}'::attachment[],
    videos video[] DEFAULT '{}'::video[],
    tags text[] DEFAULT '{}'::text[],
    featured BOOLEAN DEFAULT false
);


CREATE TABLE casethings (
    issue TEXT DEFAULT ''::text,
    communication_mode TEXT DEFAULT ''::text,
    communication_with_audience TEXT DEFAULT ''::text,
    content_country TEXT DEFAULT ''::text,
    decision_method TEXT DEFAULT ''::text,
    end_date TIMESTAMPTZ,
    facetoface_online_or_both virtualness,
    facilitated TEXT DEFAULT ''::text,
    voting voting_type,
    number_of_meeting_days INTEGER,
    ongoing BOOLEAN,
    start_date TIMESTAMPTZ,
    total_number_of_participants INTEGER,
    targeted_participant_demographic TEXT DEFAULT ''::text,
    kind_of_influence TEXT DEFAULT ''::text,
    targeted_participants_public_role TEXT DEFAULT ''::text,
    targeted_audience TEXT DEFAULT ''::text,
    participant_selection TEXT DEFAULT ''::text,
    specific_topic TEXT DEFAULT ''::text,
    staff_type TEXT DEFAULT ''::text,
    type_of_funding_entity TEXT DEFAULT ''::text,
    typical_implementing_entity TEXT DEFAULT ''::text,
    typical_sponsoring_entity TEXT DEFAULT ''::text,
    who_else_supported_the_initiative TEXT DEFAULT ''::text,
    who_was_primarily_responsible_for_organizing_the_initiative INTEGER
) INHERITS (things);

CREATE TABLE methodthings (
    best_for TEXT DEFAULT ''::text,
    communication_mode TEXT DEFAULT ''::text,
    decision_method TEXT DEFAULT ''::text,
    facilitated BOOLEAN,
    governance_contribution TEXT DEFAULT ''::text,
    issue_interdependency TEXT DEFAULT ''::text,
    issue_polarization TEXT DEFAULT ''::text,
    issue_technical_complexity TEXT DEFAULT ''::text,
    kind_of_influence TEXT DEFAULT ''::text,
    method_of_interaction TEXT DEFAULT ''::text,
    public_interaction_method TEXT DEFAULT ''::text,
    typical_funding_source TEXT DEFAULT ''::text,
    typical_implementing_entity TEXT DEFAULT ''::text,
    typical_sponsoring_entity TEXT DEFAULT ''::text
) INHERITS (things);

CREATE TABLE organizationthings (
    executive_director TEXT DEFAULT ''::text,
    issue TEXT DEFAULT ''::text,
    sector TEXT DEFAULT ''::text
) INHERITS (things);


INSERT INTO casethings (id, type, original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, issue, communication_mode, communication_with_audience, content_country, decision_method, end_date, facetoface_online_or_both, facilitated, voting, number_of_meeting_days, ongoing, start_date, total_number_of_participants, targeted_participant_demographic, kind_of_influence, targeted_participants_public_role, targeted_audience, participant_selection, specific_topic, staff_type, type_of_funding_entity, typical_implementing_entity, typical_sponsoring_entity, who_else_supported_the_initiative, who_was_primarily_responsible_for_organizing_the_initiative
) SELECT id, 'case', original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, issue, communication_mode, communication_with_audience, content_country, decision_method, end_date, facetoface_online_or_both, facilitated, voting, number_of_meeting_days, ongoing, start_date, total_number_of_participants, targeted_participant_demographic, kind_of_influence, targeted_participants_public_role, targeted_audience, participant_selection, specific_topic, staff_type, type_of_funding_entity, typical_implementing_entity, typical_sponsoring_entity, who_else_supported_the_initiative, who_was_primarily_responsible_for_organizing_the_initiative from cases;

INSERT INTO methodthings (id, type, original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, best_for, communication_mode, decision_method, facilitated, governance_contribution, issue_interdependency, issue_polarization, issue_technical_complexity, kind_of_influence, method_of_interaction, public_interaction_method, typical_funding_source, typical_implementing_entity, typical_sponsoring_entity
) SELECT id, 'method', original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, best_for, communication_mode, decision_method, facilitated, governance_contribution, issue_interdependency, issue_polarization, issue_technical_complexity, kind_of_influence, method_of_interaction, public_interaction_method, typical_funding_source, typical_implementing_entity, typical_sponsoring_entity from methods;

INSERT INTO organizationthings (id, type, original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, executive_director, issue, sector
) SELECT id, 'organization', original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, executive_director, issue, sector from organizations;

CREATE TABLE authors (
  user_id INTEGER REFERENCES users (id),
  timestamp TIMESTAMPTZ NOT NULL,
  thingid INTEGER NOT NULL-- REFERENCES things (id) -- Refererence constraints do not work with table inheritance
);

INSERT INTO authors SELECT * from case__authors;
INSERT INTO authors SELECT * from method__authors;
INSERT INTO authors SELECT * from organization__authors;

CREATE TABLE localized_texts (
  body TEXT DEFAULT ''::text,
  title TEXT NOT NULL,
  language TEXT DEFAULT 'en'::text,
  timestamp TIMESTAMPTZ DEFAULT 'now'::timestamptz,
  thingid INTEGER NOT NULL
);

INSERT INTO localized_texts (body, title, language, thingid) SELECT body, title, language, case_id from case__localized_texts;
INSERT INTO localized_texts (body, title, language, thingid) SELECT body, title, language, method_id from method__localized_texts;
INSERT INTO localized_texts (body, title, language, thingid) SELECT body, title, language, organization_id from organization__localized_texts;

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
	string_agg(tags, ' ') tagstring
  FROM
  	(SELECT things.id thingid, unnest(things.tags) tags FROM things) subtags
  GROUP BY
  	thingid
)

SELECT
		things.id,
		things.type,
		localized_texts.title,
    localized_texts.body,
		things.lead_image,
		things.updated_date,
    setweight(to_tsvector('english'::regconfig, localized_texts.title), 'A') ||
    setweight(to_tsvector('english'::regconfig, localized_texts.body), 'B') ||
    setweight(to_tsvector('english'::regconfig, alltags.tagstring), 'C') ||
    setweight(to_tsvector('english'::regconfig, allauthors.authorstring), 'D') AS document
	FROM
		things
  JOIN localized_texts ON localized_texts.thingid = things.id
  JOIN allauthors ON allauthors.thingid = things.id
  JOIN alltags ON alltags.thingid = things.id
	WHERE
		localized_texts.language = 'en' -- this is the english search view
;

CREATE INDEX idx_fts_search_en ON search_index_en USING gin(document);

DROP TABLE case__authors;
DROP TABLE method__authors;
DROP TABLE organization__authors;

DROP TABLE case__localized_texts;
DROP TABLE method__localized_texts;
DROP TABLE organization__localized_texts;

DROP TABLE cases;
DROP TABLE methods;
DROP TABLE organizations;

ALTER TABLE casethings RENAME TO cases;
ALTER TABLE methodthings RENAME TO methods;
ALTER TABLE organizationthings RENAME TO organizations;

DROP FUNCTION get_case_reference(INTEGER, TEXT);
DROP FUNCTION get_method_reference(INTEGER, TEXT);
DROP FUNCTION get_organization_reference(INTEGER, TEXT);
DROP FUNCTION get_noun_reference(TEXT, INTEGER, TEXT);

CREATE OR REPLACE FUNCTION get_object_reference(id INTEGER, language TEXT)
RETURNS object_reference AS
$$
SELECT
    ROW(id, type, title, lead_image, post_date, updated_date)::object_reference
  FROM
    localized_texts,
    things
  WHERE
    localized_texts.thingid = $1 AND
    localized_texts.language = $2 AND
    things.id = $1
$$
LANGUAGE 'sql' STABLE;


-- Get all related nouns as a table
CREATE OR REPLACE FUNCTION related_nouns_of_type_for_type(related_type TEXT, source_type TEXT, source_id INTEGER, language TEXT)
RETURNS TABLE (reference object_reference) AS
$$
SELECT get_object_reference(id_2, $4)
FROM related_nouns
WHERE type_1 = $2 AND
    id_1 = $3 AND
    type_2 = $1
UNION
SELECT get_object_reference(id_1, $4)
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

ALTER TABLE related_nouns DROP CONSTRAINT sorted;
ALTER TABLE related_nouns ADD CONSTRAINT sorted CHECK(id_1 < id_2);
