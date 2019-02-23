-- for reference
-- CREATE TYPE full_link AS (
-- 	url text,
-- 	attribution text,
-- 	title text
-- );

CREATE FUNCTION urls_to_links(urls text[]) RETURNS full_link[]
  LANGUAGE sql STABLE
  AS $_$
  SELECT
  array_agg((url, null, null)::full_link) as links
  from unnest(urls) as url;
$_$;

ALTER TABLE cases ADD COLUMN evaluation_reports_full full_link[] DEFAULT '{}';
ALTER TABLE cases ADD COLUMN evaluation_links_full full_link[] DEFAULT '{}';

UPDATE cases SET evaluation_reports_full = urls_to_links(evaluation_reports) WHERE evaluation_reports <> '{}';

UPDATE cases SET evaluation_links_full =
urls_to_links(evaluation_links) WHERE evaluation_links <> '{}';

ALTER TABLE cases DROP COLUMN evaluation_reports;
ALTER TABLE cases RENAME COLUMN evaluation_reports_full TO evaluation_reports;

ALTER TABLE cases DROP COLUMN evaluation_links;
ALTER TABLE cases RENAME COLUMN evaluation_links_full TO evaluation_links;
