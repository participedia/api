-- Create different representation of "things" to return

-- object_short replaces object_reference
CREATE TYPE object_short AS (
  id INTEGER,
  title TEXT,
  type TEXT,
  images TEXT[],
  post_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ
);

CREATE TYPE object_medium AS (
  id INTEGER,
  title TEXT,
  type TEXT,
  images TEXT[],
  post_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ,
  body TEXT,
  bookmarked BOOLEAN,
  location geolocation
);

ALTER TABLE things ADD COLUMN images TEXT[] DEFAULT '{}';

WITH imageurls AS
  (
    select id, array_agg((images).url) images from (
    	select id, lead_image images from things
    		where (lead_image).url is not null and
    		      (lead_image).url != ''
    	union all
    	select id, unnest(other_images) images  from things where other_images is not null
    ) as unwrapped_images
    group by id
  )
UPDATE things
  SET images = imageurls.images
  FROM imageurls
  WHERE imageurls.id = things.id
;

--
-- Name: get_object_reference(integer, text); Type: FUNCTION; Schema: public; Owner: -
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
-- Name: related_nouns_of_type_for_type(text, text, integer, text); Type: FUNCTION; Schema: public; Owner: -
--

DROP FUNCTION related_nouns_of_type_for_type(TEXT, TEXT, INTEGER, TEXT);

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
-- Name: get_related_nouns(text, text, integer, text); Type: FUNCTION; Schema: public; Owner: -
--

DROP FUNCTION get_related_nouns(TEXT, TEXT, INTEGER, TEXT);

CREATE FUNCTION get_related_nouns(related_type text, source_type text, source_id integer, language text) RETURNS object_short[]
    LANGUAGE sql STABLE
    AS $_$
SELECT ARRAY(SELECT ROW(rel.*)::object_short FROM related_nouns_of_type_for_type($1, $2, $3, $4) rel);
$_$;


DROP FUNCTION get_object_reference(INTEGER, TEXT);

ALTER TABLE things DROP COLUMN lead_image,
                   DROP COLUMN other_images;

DROP TYPE object_reference;
