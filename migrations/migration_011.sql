CREATE TYPE localized_value AS (
  key text,
  lookup_key text,
  value text
);

--
-- move from files as array of urls to full_files as array of composite types
--

CREATE TYPE full_file AS (
  url text,
  source_url text,
  attribution text,
  title text
);

ALTER TABLE cases ADD COLUMN full_files full_file[] DEFAULT '{}';

UPDATE cases set full_files = b.full_files from (
  select a.id, array_agg((a.file,'','','')::full_file) as full_files from (
    select id, unnest(files) as file from cases where array_length(files, 1) > 0
  ) as a group by id
) as b where b.id = cases.id;

-- The following two lines don't work because files are part of things table
-- ALTER TABLE cases DROP COLUMN files;
-- ALTER TABLE cases RENAME COLUMN full_files TO files;

--
-- move from links as array of urls to full_links as array of composite types
--

CREATE TYPE full_link AS (
  url text,
  attribution text,
  title text
);

ALTER TABLE CASES ADD COLUMN full_links full_link[] DEFAULT '{}';

UPDATE cases set full_links = b.full_links from (
  select a.id, array_agg((a.link, '', '')::full_link) as full_links from (
    select id, unnest(links) as link from cases where array_length(links, 1) > 0
  ) as a group by id
) as b where b.id = cases.id;

--
-- move from photos as array of urls to full_photos as array of composite types
--

CREATE TYPE photo AS (
  url text,
  source_url text,
  attribution text,
  title text
);

ALTER TABLE cases ADD COLUMN photos photo[] DEFAULT '{}';

UPDATE cases set photos = b.photos from (
  select a.id, array_agg((a.photo,'','','')::photo) as photos from (
    select id, unnest(images) as photo from cases where array_length(images, 1) > 0
  ) as a group by id
) as b where b.id = cases.id;

--
-- move from videos as array of urls to full_videos as array of composite types
--

CREATE TYPE full_video AS (
  url text,
  attribution text,
  title text
);

ALTER TABLE cases ADD COLUMN full_videos full_video[] DEFAULT '{}';

UPDATE cases set full_videos = b.full_videos from (
  select a.id, array_agg((a.video, '', '')::full_video) as full_videos from (
    select id, unnest(videos) as video from cases where array_length(videos, 1) > 0
  ) as a group by id
) as b where b.id = cases.id;

--
-- Add column for audio as array of composite type
--

CREATE TYPE full_audio AS (
  url text,
  attribution text,
  title text
);

ALTER TABLE CASES ADD COLUMN audio full_audio[] DEFAULT '{}';

CREATE TYPE full_object_title AS (
  id integer,
  type text,
  title text
);

--
-- Issues -> General Issues
--
ALTER TABLE cases RENAME COLUMN issues TO general_issues;

--
-- Add method_types
--
ALTER TABLE cases ADD COLUMN method_types text[] DEFAULT '{}';

-- Add tools_techniques_types

ALTER TABLE cases ADD COLUMN tools_techniques_types text[] DEFAULT '{}';

UPDATE cases SET scope_of_influence = ltrim(rtrim(scope_of_influence, '}'), '{');
ALTER TABLE case_view_localized RENAME COLUMN scope_value_citytown TO "scope_value_city/town";

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
-- Name: get_object_title(integer, text); Type: FUNCTION; Schema: public; Owner: -
--
DROP FUNCTION get_object_title(integer, text);
CREATE OR REPLACE FUNCTION get_object_title(id integer, language text) RETURNS full_object_title
    LANGUAGE sql STABLE
    AS $_$
SELECT
    ROW(id, type, get_title($1, $2))::full_object_title
  FROM
    things
  WHERE
    things.id = $1
$_$;

ALTER TABLE cases ADD COLUMN specific_methods_tools_techniques integer[] DEFAULT '{}';

ALTER TABLE cases ADD COLUMN primary_organizer integer;
