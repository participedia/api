
--
-- Name: get_components(integer, text): Type: FUNCTION, Schema: public: Owner: -
--
DROP function get_components(integer, text);
CREATE OR REPLACE FUNCTION get_components(id integer, language text) RETURNS full_object_title[]
    LANGUAGE sql STABLE
    AS $_$
SELECT COALESCE(array_agg( get_object_title(cases.id, language)), '{}'::full_object_title[])
FROM cases
WHERE cases.is_component_of = $1;
$_$;

CREATE OR REPLACE FUNCTION get_object_title_list(ids integer[], language text) RETURNS full_object_title[]
  LANGUAGE sql STABLE
  AS $_$
SELECT array_agg(get_object_title(id, language))
FROM unnest(ids) as id;
$_$;

--
-- Define what a case looks like when a case is shown to user
--

DROP TYPE full_case CASCADE;

CREATE TYPE full_case AS (
  id integer,
  type text,
  title text,
  general_issues localized_value[],
  specific_topics localized_value[],
  brief_description text,
  body text,
  tags localized_value[],
  location_name text,
  address1 text,
  address2 text,
  city text,
  province text,
  postal_code text,
  country text,
  latitude text,
  longitude text,
  scope_of_influence localized_value,
  has_components full_object_title[],
  is_component_of full_object_title,
  files full_file[],
  links full_link[],
  photos photo[],
  videos full_video[],
  audio full_audio[],
  start_date timestamp without time zone,
  end_date timestamp without time zone,
  ongoing boolean,
  time_limited localized_value,
  purpose localized_value[],
  approach localized_value[],
  public_spectrum localized_value,
  number_of_participants integer,
  open_limited localized_value,
  recruitment_method localized_value,
  targeted_participants localized_value[],
  method_types localized_value[],
  tools_techniques_types localized_value[],
  specific_methods_tools_techniques full_object_title[],
  legality localized_value,
  facilitators localized_value,
  facilitator_training localized_value,
  facetoface_online_or_both localized_value,
  participants_interaction localized_value[],
  learning_resources localized_value[],
  decision_methods localized_value[],
  if_voting localized_value[],
  insights_outcomes localized_value[],
  primary_organizer full_object_title,
  organizer_types localized_value[],
  funder text,
  funder_types localized_value[],
  staff boolean,
  volunteers boolean,
  impact_evidence text, -- should be boolean
  change_types localized_value[],
  implementers_of_change localized_value[],
  formal_evaluation text, -- should be boolean
  evaluation_reports text[],
  evaluation_links text[],
  bookmarked boolean,
  creator author,
  last_updated_by author,

  original_language text,
  post_date timestamp without time zone,
  published boolean,
  updated_date timestamp without time zone,
  featured boolean,
  hidden boolean

);

CREATE OR REPLACE FUNCTION get_case_localized_value(field text, key text, lookup json) RETURNS localized_value
  LANGUAGE sql STABLE
  AS $_$
SELECT (key, concat(field, '_value_', key), trim('"' from (lookup->concat(field, '_value_', key))::text))::localized_value as value
$_$;

CREATE OR REPLACE FUNCTION get_case_localized_list(field text, keys text[], lookup json) RETURNS localized_value[]
  LANGUAGE sql STABLE
  AS $_$
  SELECT array_agg((key, concat(field, '_value_', key), trim('"' from (lookup->concat(field, '_value_', key))::text))::localized_value) as values from (
    SELECT field, unnest(keys) as key
  ) as a group by field
$_$;

CREATE OR REPLACE FUNCTION get_case_by_id(id integer, language text, userid integer) RETURNS full_case
    LANGUAGE sql STABLE
    AS $_$
WITH localized AS (
  SELECT to_json(case_view_localized.*) as lookup FROM case_view_localized WHERE language = $2
)
SELECT
  id,
  type,
  title,
  get_case_localized_list('general_issues', general_issues, lookup) as general_issues,
  get_case_localized_list('specific_topics', specific_topics, lookup) as specific_topics,
  description,
  body,
  get_case_localized_list('tags', tags, lookup) as tags,
  location_name,
  address1,
  address2,
  city,
  province,
  postal_code,
  country,
  latitude,
  longitude,
  get_case_localized_value('scope', scope_of_influence, lookup) as scope_of_influence,
  get_components($1, language) as has_components,
  get_object_title(is_component_of, language) as is_component_of,
  full_files as files,
  full_links as links,
  photos,
  full_videos as videos,
  audio,
  start_date,
  end_date,
  ongoing,
  get_case_localized_value('time_limited', time_limited, lookup) as time_limited,
  get_case_localized_list('purposes', purposes, lookup) as purposes,
  get_case_localized_list('approaches', approaches, lookup) as approaches,
  get_case_localized_value('public_spectrum', public_spectrum, lookup) as public_spectrum,
  number_of_participants,
  get_case_localized_value('open_limited', open_limited, lookup) as open_limited,
  get_case_localized_value('recruitment_method', recruitment_method, lookup) as recruitement_method,
  get_case_localized_list('targeted_participants', targeted_participants, lookup) as targeted_participants,
  get_case_localized_list('method_types', method_types, lookup) as method_types,
  get_case_localized_list('tools_techniques_types', tools_techniques_types, lookup) as tools_techniques_types,
  get_object_title_list(specific_methods_tools_techniques, language),
  get_case_localized_value('legality', legality, lookup) as legality,
  get_case_localized_value('facilitators', facilitators, lookup) as facilitators,
  get_case_localized_value('facilitator_training', facilitator_training, lookup) as facilitator_training,
  get_case_localized_value('facetoface_online_or_both', facetoface_online_or_both, lookup) as facetoface_online_or_both,
  get_case_localized_list('participants_interactions', participants_interactions, lookup)  as participants_interactions,
  get_case_localized_list('learning_resources', learning_resources, lookup) as learning_resources,
  get_case_localized_list('decision_methods', decision_methods, lookup) as decision_methods,
  get_case_localized_list('if_voting', if_voting, lookup) as if_voting,
  get_case_localized_list('insights_outcomes', insights_outcomes, lookup) as insights_outcomes,
  get_object_title(primary_organizer, language) as primary_organizer,
  get_case_localized_list('organizer_types', organizer_types, lookup) as organizer_types,
  funder,
  get_case_localized_list('funder_types', funder_types, lookup) as funder_types,
  staff,
  volunteers,
  impact_evidence,
  get_case_localized_list('change_types', change_types, lookup) as change_types,
  get_case_localized_list('implementers_of_change', implementers_of_change, lookup) as implementers_of_change,
  formal_evaluation,
  evaluation_reports,
  evaluation_links,
  bookmarked('case', $1, $3),
  first_author($1) AS creator,
  last_author($1) AS last_updated_by,

  original_language,
  post_date,
  published,
  updated_date,
  featured,
  hidden
FROM
  cases,
  get_localized_texts($1, $2) as localized_texts,
  localized
WHERE
  cases.id = $1
;

$_$;
