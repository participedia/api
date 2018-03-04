--
-- Name: bookmarked(text, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION bookmarked(type text, thingid integer, userid integer) RETURNS boolean
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
END
$_$;

--
-- Name: get_components(integer, text): Type: FUNCTION, Schema: public: Owner: -
--
CREATE OR REPLACE FUNCTION get_components(id integer, language text) RETURNS object_title[]
    LANGUAGE sql STABLE
    AS $_$
SELECT COALESCE(array_agg((cases.id, localized_texts.title)::object_title), '{}'::object_title[])
FROM cases, localized_texts
WHERE cases.is_component_of = $1 AND
      localized_texts.thingid = cases.id AND
      localized_texts.language = $2
$_$;

--
-- Name: get_methods(case, text): Type: FUNCTION, Schema: public: Owner: -
--
CREATE OR REPLACE FUNCTION get_methods(thing cases, language text) RETURNS object_title[]
    LANGUAGE sql STABLE
    AS $_$
    with mids as (select unnest($1.process_methods) as id)
    SELECT
      COALESCE(array_agg((mids.id, title)::object_title), '{}'::object_title[])
    FROM
      localized_texts, mids
    WHERE
      localized_texts.thingid = mids.id and
      localized_texts.language = $2
$_$;

--
-- Name: get_organizations(case, text): Type: FUNCTION, Schema: public: Owner: -
--
CREATE OR REPLACE FUNCTION get_organizations(thing cases, language text) RETURNS object_title[]
    LANGUAGE sql STABLE
    AS $_$
    with mids as (select unnest($1.primary_organizers) as id)
    SELECT
      COALESCE(array_agg((mids.id, title)::object_title), '{}'::object_title[])
    FROM
      localized_texts, mids
    WHERE
      localized_texts.thingid = mids.id and
      localized_texts.language = $2
$_$;


--
-- Name: get_object_short(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION get_object_short(id integer, language text) RETURNS object_short
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
    things.id = $1
$_$;

--
-- Name: get_object_title(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION get_object_title(id integer, language text) RETURNS object_title
    LANGUAGE sql STABLE
    AS $_$
SELECT
    ROW(id, title)::object_title
  FROM
    localized_texts,
    things
  WHERE
    localized_texts.thingid = $1 AND
    localized_texts.language = $2 AND
    things.id = $1
$_$;

---
--- Name: get_location(id integer); Type: FUNCTION; Schema: public; Owner: -
---

CREATE OR REPLACE FUNCTION get_location(id integer) RETURNS geolocation
  LANGUAGE sql STABLE
  AS $_$
SELECT
  ROW(location_name, address1, address2, city, province, postal_code, country, latitude, longitude)::geolocation
FROM
  things
WHERE
  things.id = $1
$_$;

---
--- Name: get_localized_text(thingid, language); Type: FUNCTION; Schema: public; Owner: -
---

CREATE OR REPLACE FUNCTION get_localized_texts(thingid integer, language text) RETURNS localized_texts
  LANGUAGE sql STABLE
  AS $_$
  SELECT body, title, description, language, "timestamp", thingid FROM (
    SELECT body, title, description, language, "timestamp", thingid,
    ROW_NUMBER() OVER (PARTITION BY thingid ORDER BY "timestamp" DESC) rn
    FROM localized_texts
    WHERE thingid = $1 AND language = $2
  ) tmp WHERE rn = 1
$_$;

---
--- Name: get_authors(thingid); Type: FUNCTION: Schema: public; Owner: -
---

CREATE OR REPLACE FUNCTION get_authors(thingid integer) RETURNS author[]
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
    a2
$_$;
