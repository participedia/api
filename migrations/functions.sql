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
END
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
    things.id = $1
$_$;


--
-- Name: get_related_nouns(text, text, integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION get_related_nouns(related_type text, source_type text, source_id integer, language text) RETURNS object_short[]
    LANGUAGE sql STABLE
    AS $_$
SELECT ARRAY(SELECT ROW(rel.*)::object_short FROM related_nouns_of_type_for_type($1, $2, $3, $4) rel);
$_$;


--
-- Name: related_nouns_of_type_for_type(text, text, integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION related_nouns_of_type_for_type(related_type text, source_type text, source_id integer, language text) RETURNS TABLE(reference object_short)
    LANGUAGE sql STABLE
    AS $_$
SELECT get_object_short(id_2, $4)
FROM related_nouns
WHERE type_1 = $2 AND
    id_1 = $3 AND
    type_2 = $1
UNION
SELECT get_object_short(id_1, $4)
FROM related_nouns
WHERE type_1 = $1 AND
    id_2 = $3 AND
    type_2 = $2
$_$;

--
-- Name: search_index_en; Type: MATERIALIZED VIEW DATA; Schema: public; Owner: -
--

REFRESH MATERIALIZED VIEW search_index_en;
