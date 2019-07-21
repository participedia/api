
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
