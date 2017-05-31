CREATE TABLE things (
    id SERIAL PRIMARY KEY,
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


INSERT INTO casethings (id, original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, issue, communication_mode, communication_with_audience, content_country, decision_method, end_date, facetoface_online_or_both, facilitated, voting, number_of_meeting_days, ongoing, start_date, total_number_of_participants, targeted_participant_demographic, kind_of_influence, targeted_participants_public_role, targeted_audience, participant_selection, specific_topic, staff_type, type_of_funding_entity, typical_implementing_entity, typical_sponsoring_entity, who_else_supported_the_initiative, who_was_primarily_responsible_for_organizing_the_initiative
) SELECT id, original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, issue, communication_mode, communication_with_audience, content_country, decision_method, end_date, facetoface_online_or_both, facilitated, voting, number_of_meeting_days, ongoing, start_date, total_number_of_participants, targeted_participant_demographic, kind_of_influence, targeted_participants_public_role, targeted_audience, participant_selection, specific_topic, staff_type, type_of_funding_entity, typical_implementing_entity, typical_sponsoring_entity, who_else_supported_the_initiative, who_was_primarily_responsible_for_organizing_the_initiative from cases;

INSERT INTO methodthings (id, original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, best_for, communication_mode, decision_method, facilitated, governance_contribution, issue_interdependency, issue_polarization, issue_technical_complexity, kind_of_influence, method_of_interaction, public_interaction_method, typical_funding_source, typical_implementing_entity, typical_sponsoring_entity
) SELECT id, original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, best_for, communication_mode, decision_method, facilitated, governance_contribution, issue_interdependency, issue_polarization, issue_technical_complexity, kind_of_influence, method_of_interaction, public_interaction_method, typical_funding_source, typical_implementing_entity, typical_sponsoring_entity from methods;

INSERT INTO organizationthings (id, original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, executive_director, issue, sector
) SELECT id, original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, executive_director, issue, sector from organizations;

CREATE TABLE authors (
  user_id INTEGER REFERENCES users (id),
  timestamp TIMESTAMPTZ NOT NULL,
  thingid INTEGER -- REFERENCES things (id) -- Refererence constraints do not work with table inheritance
);

INSERT INTO authors SELECT * from case__authors;
INSERT INTO authors SELECT * from method__authors;
INSERT INTO authors SELECT * from organization__authors;

 -- Modify Materialized view and index for English searches

DROP MATERIALIZED VIEW search_index_en;

 CREATE MATERIALIZED VIEW search_index_en AS

 WITH case_authors AS (
   SELECT cases.id thingid, string_agg(users.name, ' ') authors
   FROM users, authors, cases
   WHERE
    authors.user_id = users.id AND
    authors.thingid = cases.id
   GROUP BY cases.id
),
method_authors as (
   SELECT methods.id thingid, string_agg(users.name, ' ') authors
   FROM users, authors, methods
   WHERE
    authors.user_id = users.id AND
    authors.thingid = methods.id
   GROUP BY methods.id
),
organization_authors as (
   SELECT organizations.id thingid, string_agg(users.name, ' ') authors
   FROM users, authors, organizations
   WHERE
    authors.user_id = users.id AND
    authors.thingid = organizations.id
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
  JOIN case_authors ON case_authors.thingid = cases.id
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
  JOIN method_authors ON method_authors.thingid = methods.id
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
  JOIN organization_authors ON organization_authors.thingid = organizations.id
  JOIN organization_tags ON organization_tags.organization_id = organizations.id
	WHERE
		organization__localized_texts.language = 'en'
;

CREATE INDEX idx_fts_search_en ON search_index_en USING gin(document);

DROP TABLE case__authors;
DROP TABLE method__authors;
DROP TABLE organization__authors;
