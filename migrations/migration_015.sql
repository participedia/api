CREATE OR REPLACE FUNCTION get_case_localized_value(field text, key text, lookup json) RETURNS localized_value
  LANGUAGE sql STABLE
  AS $_$
  SELECT
    CASE
      WHEN key = 'yes' then (key, key, trim('"' from (lookup->key)::text))::localized_value
      WHEN key = 'no' then (key, key, trim('"' from (lookup->key)::text))::localized_value
      WHEN key = 'true' then (key, key, trim('"' from (lookup->key)::text))::localized_value
      WHEN key = 'false' then (key, key, trim('"' from (lookup->key)::text))::localized_value
      WHEN key = '' then ('', '', '')::localized_value
      ELSE (key, concat(field, '_value_', key), trim('"' from (lookup->concat(field, '_value_', key))::text))::localized_value
    END
    AS value
$_$;

-- CREATE OR REPLACE FUNCTION get_case_localized_list_or_null(field text, keys text[], lookup json) RETURNS localized_value[]
--   LANGUAGE sql STABLE
--   AS $_$
--   SELECT array_agg((key, concat(field, '_value_', key), trim('"' from (lookup->concat(field, '_value_', key))::text))::localized_value) as values from (
--     SELECT field, unnest(keys) as key
--   ) as a group by field
-- $_$;

CREATE OR REPLACE FUNCTION get_case_localized_list_or_null(field text, keys text[], lookup json) RETURNS localized_value[]
  LANGUAGE sql STABLE
  AS $_$
  SELECT array_agg(get_case_localized_value(field, key, lookup)) as values from (
    SELECT field, unnest(keys) as key
  ) as a group by field
$_$;

CREATE OR REPLACE FUNCTION get_case_localized_list(field text, keys text[], lookup json) RETURNS localized_value[]
  LANGUAGE sql STABLE
  AS $_$
  SELECT COALESCE(get_case_localized_list_or_null(field, keys, lookup), '{}');
$_$;


CREATE OR REPLACE FUNCTION local_tag(tag text, lookup json) RETURNS text
  LANGUAGE sql STABLE
  AS $_$
  SELECT trim('"' from (lookup->>tag)::text);
$_$;


CREATE OR REPLACE FUNCTION get_localized_tags_or_null(language text, tags text[]) RETURNS localized_value[]
  LANGUAGE sql STABLE
  AS $_$
WITH localized AS (
    SELECT to_json(tags_localized.*) as lookup FROM tags_localized WHERE language = language
  )
  SELECT array_agg((tag, tag, local_tag(tag, lookup))::localized_value) as values from (
    SELECT
       unnest(tags) as tag
  ) as a,
  localized
  group by language
$_$;

CREATE OR REPLACE FUNCTION get_localized_tags(language text, tags text[]) returns localized_value[]
  LANGUAGE sql STABLE
  AS $_$
SELECT COALESCE(get_localized_tags_or_null(language, tags), '{}');
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
  get_localized_tags($2, tags) as tags,
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
