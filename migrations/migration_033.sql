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
		cases.id,
    cases.type,
    localized_texts.title,
    localized_texts.body,
    setweight(to_tsvector('english'::regconfig, localized_texts.title), 'A') ||
    setweight(to_tsvector('english'::regconfig, localized_texts.body), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(alltags.tagstring, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, allauthors.authorstring), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE((cases.location).city, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE((cases.location).country, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.issue, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.communication_mode, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.communication_with_audience, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.decision_method, '')), 'A') ||
    -- can't default enums to empty strings
    -- setweight(to_tsvector('english'::regconfig, cases.facetoface_online_or_both), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.facilitated, '')), 'A') ||
    -- ibid
    -- setweight(to_tsvector('english'::regconfig, COALESCE(cases.voting, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.targeted_participant_demographic, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.kind_of_influence, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.targeted_participants_public_role, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.targeted_audience, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.participant_selection, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.specific_topic, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.staff_type, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.type_of_funding_entity, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.typical_implementing_entity, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.typical_sponsoring_entity, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.who_else_supported_the_initiative, '')), 'A')
    AS document
	FROM
		cases
  JOIN localized_texts ON localized_texts.thingid = cases.id
  JOIN allauthors ON allauthors.thingid = cases.id
  LEFT JOIN alltags ON alltags.thingid = cases.id
	WHERE
    cases.hidden = false AND
		localized_texts.language = 'en' -- this is the english search view
UNION
SELECT
		methods.id,
    methods.type,
    localized_texts.title,
    localized_texts.body,
    setweight(to_tsvector('english'::regconfig, localized_texts.title), 'A') ||
    setweight(to_tsvector('english'::regconfig, localized_texts.body), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(alltags.tagstring, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, allauthors.authorstring), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.best_for, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.communication_mode, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.decision_method, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.governance_contribution, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.issue_interdependency, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.issue_polarization, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.issue_technical_complexity, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.kind_of_influence, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.method_of_interaction, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.public_interaction_method, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.typical_funding_source, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.typical_implementing_entity, '')), 'A')
    AS document
	FROM
		methods
  JOIN localized_texts ON localized_texts.thingid = methods.id
  JOIN allauthors ON allauthors.thingid = methods.id
  LEFT JOIN alltags ON alltags.thingid = methods.id
	WHERE
    methods.hidden = false AND
		localized_texts.language = 'en' -- this is the english search view
UNION
SELECT
		organizations.id,
    organizations.type,
    localized_texts.title,
    localized_texts.body,
    setweight(to_tsvector('english'::regconfig, localized_texts.title), 'A') ||
    setweight(to_tsvector('english'::regconfig, localized_texts.body), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(alltags.tagstring, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, allauthors.authorstring), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE((organizations.location).city, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE((organizations.location).country, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(organizations.executive_director, '')), 'A')
    AS document
	FROM
		organizations
  JOIN localized_texts ON localized_texts.thingid = organizations.id
  JOIN allauthors ON allauthors.thingid = organizations.id
  LEFT JOIN alltags ON alltags.thingid = organizations.id
	WHERE
    organizations.hidden = false AND
		localized_texts.language = 'en' -- this is the english search view
;

CREATE INDEX idx_fts_search_en ON search_index_en USING gin(document);
