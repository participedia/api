
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
