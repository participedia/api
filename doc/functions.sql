
--
-- Name: bookmarked(text, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION bookmarked(type text, thingid integer, userid integer) RETURNS boolean
    LANGUAGE sql STABLE
    AS $_$
SELECT CASE
  WHEN EXISTS
  (
    SELECT 1
    FROM bookmarks
    WHERE bookmarktype = $1
      AND thingid = $2
      AND userid = $3
  )
  THEN true
  ELSE false
END;
$_$;


--
-- Name: case_static_local(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION case_static_local(language text) RETURNS record
    LANGUAGE sql STABLE
    AS $_$
  SELECT
    case_static_localized.*,
    case_sections($1) as sections,
    tool_types_values($1) as tool_types
  FROM
    case_static_localized
  WHERE
    language = $1;
  $_$;


--
-- Name: first_author(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION first_author(thingid integer) RETURNS author
    LANGUAGE sql STABLE
    AS $_$
  SELECT
    authors.user_id,
    authors.timestamp,
    users.name
  FROM
    authors,
    users
  WHERE
    authors.user_id = users.id AND
    authors.thingid = $1
  ORDER BY
    authors.timestamp ASC
  LIMIT 1;
$_$;


--
-- Name: get_authors(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_authors(thingid integer) RETURNS author[]
    LANGUAGE sql STABLE
    AS $_$
WITH a2 AS (
    SELECT DISTINCT ON (authors.user_id)
      authors.user_id,
      authors.timestamp,
      users.name
    FROM
      authors,
      users
    WHERE
      authors.user_id = users.id AND
      authors.thingid = $1
    ORDER BY
      authors.user_id,
      authors.timestamp
)
SELECT
    array_agg((
      a2.user_id,
      a2.timestamp,
      a2.name
    )::author) authors
FROM
    a2;
$_$;


--
-- Name: get_body(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_body(thingid integer, language text) RETURNS text
    LANGUAGE sql STABLE
    AS $_$
SELECT body
FROM localized_texts
WHERE thingid = $1 AND language = $2
ORDER BY timestamp DESC
LIMIT 1;
$_$;


--
-- Name: get_case_by_id(integer, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_case_by_id(id integer, language text, userid integer) RETURNS full_case
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


--
-- Name: get_case_localized_list(text, text[], json); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_case_localized_list(field text, keys text[], lookup json) RETURNS localized_value[]
    LANGUAGE sql STABLE
    AS $$
  SELECT COALESCE(get_case_localized_list_or_null(field, keys, lookup), '{}');
$$;


--
-- Name: get_case_localized_list_or_null(text, text[], json); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_case_localized_list_or_null(field text, keys text[], lookup json) RETURNS localized_value[]
    LANGUAGE sql STABLE
    AS $$
  SELECT array_agg(get_case_localized_value(field, key, lookup)) as values from (
    SELECT field, unnest(keys) as key
  ) as a group by field
$$;


--
-- Name: get_case_localized_value(text, text, json); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_case_localized_value(field text, key text, lookup json) RETURNS localized_value
    LANGUAGE sql STABLE
    AS $$
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
$$;


--
-- Name: get_component(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_component(id integer, language text) RETURNS full_object_title
    LANGUAGE sql STABLE
    AS $$
  SELECT CASE WHEN EXISTS(select id)
  THEN (id, 'case', get_object_title(id, language))::full_object_title
  ELSE NULL
END;
$$;


--
-- Name: get_components(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_components(id integer, language text) RETURNS full_object_title[]
    LANGUAGE sql STABLE
    AS $_$
SELECT COALESCE(array_agg( get_object_title(cases.id, language)), '{}'::full_object_title[])
FROM cases
WHERE cases.is_component_of = $1;
$_$;


--
-- Name: get_description(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_description(thingid integer, language text) RETURNS text
    LANGUAGE sql STABLE
    AS $_$
SELECT description
FROM localized_texts
WHERE thingid = $1 AND language = $2
ORDER BY timestamp DESC
LIMIT 1;
$_$;


--
-- Name: get_localized_tags(text, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_localized_tags(language text, tags text[]) RETURNS localized_value[]
    LANGUAGE sql STABLE
    AS $$
SELECT COALESCE(get_localized_tags_or_null(language, tags), '{}');
$$;


--
-- Name: get_localized_tags_or_null(text, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_localized_tags_or_null(language text, tags text[]) RETURNS localized_value[]
    LANGUAGE sql STABLE
    AS $$
WITH localized AS (
    SELECT to_json(tags_localized.*) as lookup FROM tags_localized WHERE language = language
  )
  SELECT array_agg((tag, tag, local_tag(tag, lookup))::localized_value) as values from (
    SELECT
       unnest(tags) as tag
  ) as a,
  localized
  group by language
$$;


--
-- Name: get_localized_texts(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_localized_texts(thingid integer, language text) RETURNS localized_texts
    LANGUAGE sql STABLE
    AS $_$
  SELECT body, title, description, language, "timestamp", thingid FROM (
    SELECT body, title, description, language, "timestamp", thingid,
    ROW_NUMBER() OVER (PARTITION BY thingid ORDER BY "timestamp" DESC) rn
    FROM localized_texts
    WHERE thingid = $1 AND language = $2
  ) tmp WHERE rn = 1;
$_$;


--
-- Name: get_location(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_location(id integer) RETURNS geolocation
    LANGUAGE sql STABLE
    AS $_$
SELECT
  ROW(location_name, address1, address2, city, province, postal_code, country, latitude, longitude)::geolocation
FROM
  things
WHERE
  things.id = $1;
$_$;


--
-- Name: get_methods(cases, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_methods(thing cases, language text) RETURNS object_title[]
    LANGUAGE sql STABLE
    AS $_$
    with mids as (select unnest($1.process_methods) as id)
    SELECT
      COALESCE(array_agg((mids.id, title)::object_title), '{}'::object_title[])
    FROM
      localized_texts, mids
    WHERE
      localized_texts.thingid = mids.id and
      localized_texts.language = $2;
$_$;


--
-- Name: get_object_short(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_object_short(id integer, language text) RETURNS object_short
    LANGUAGE sql STABLE
    AS $_$
SELECT
    ROW(id, title, type, images, post_date, updated_date)::object_short
  FROM
    localized_texts,
    things
  WHERE
    localized_texts.thingid = $1 AND
    localized_texts.language = $2 AND
    things.id = $1;
$_$;


--
-- Name: get_object_title(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_object_title(id integer, language text) RETURNS full_object_title
    LANGUAGE sql STABLE
    AS $_$
SELECT
    ROW(id, type, get_title($1, $2))::full_object_title
  FROM
    things
  WHERE
    things.id = $1
$_$;


--
-- Name: get_object_title_list(integer[], text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_object_title_list(ids integer[], language text) RETURNS full_object_title[]
    LANGUAGE sql STABLE
    AS $$
SELECT array_agg(get_object_title(id, language))
FROM unnest(ids) as id;
$$;


--
-- Name: get_organizations(cases, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_organizations(thing cases, language text) RETURNS object_title[]
    LANGUAGE sql STABLE
    AS $_$
    with mids as (select unnest($1.primary_organizers) as id)
    SELECT
      COALESCE(array_agg((mids.id, title)::object_title), '{}'::object_title[])
    FROM
      localized_texts, mids
    WHERE
      localized_texts.thingid = mids.id and
      localized_texts.language = $2;
$_$;


--
-- Name: get_title(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_title(thingid integer, language text) RETURNS text
    LANGUAGE sql STABLE
    AS $_$
SELECT title
FROM localized_texts
WHERE thingid = $1 AND language = $2
ORDER BY timestamp DESC
LIMIT 1;
$_$;


--
-- Name: last_author(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION last_author(thingid integer) RETURNS author
    LANGUAGE sql STABLE
    AS $_$
  SELECT
    authors.user_id,
    authors.timestamp,
    users.name
  FROM
    authors,
    users
  WHERE
    authors.user_id = users.id AND
    authors.thingid = $1
  ORDER BY
    authors.timestamp DESC
  LIMIT 1;
$_$;


--
-- Name: local_tag(text, json); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION local_tag(tag text, lookup json) RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT trim('"' from (lookup->>tag)::text);
$$;


--
-- Name: rotate_case_edit_localized(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION rotate_case_edit_localized(language text) RETURNS TABLE(key text, value text)
    LANGUAGE sql STABLE
    AS $$
WITH localized as
  (SELECT to_json(case_edit_localized.*) as lookup FROM case_edit_localized WHERE language = language)
select key,value from (select (json_each_text(lookup)).* from localized) as a;
$$;


--
-- Name: rotate_case_view_localized(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION rotate_case_view_localized(language text) RETURNS TABLE(key text, value text)
    LANGUAGE sql STABLE
    AS $$
WITH localized as
  (SELECT to_json(case_view_localized.*) as lookup FROM case_view_localized WHERE language = language)
select key,value from (select (json_each_text(lookup)).* from localized) as a;
$$;


--
-- Name: rotate_layout_localized(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION rotate_layout_localized(language text) RETURNS TABLE(key text, value text)
    LANGUAGE sql STABLE
    AS $$
WITH localized as
  (SELECT to_json(layout_localized.*) as lookup FROM layout_localized WHERE language = language)
select key,value from (select (json_each_text(lookup)).* from localized) as a;
$$;


--
-- Name: rotate_tags_localized(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION rotate_tags_localized(language text) RETURNS TABLE(key text, value text)
    LANGUAGE sql STABLE
    AS $$
WITH localized as
  (SELECT to_json(tags_localized.*) as lookup FROM tags_localized WHERE language = language)
select key,value from (select (json_each_text(lookup)).* from localized) as a;
$$;
