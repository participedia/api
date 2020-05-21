DROP FUNCTION IF EXISTS get_object_title_list(integer[], text, text);
CREATE OR REPLACE FUNCTION get_object_title_list(ids integer[], language text, origlang text) RETURNS full_object_title[]
  LANGUAGE sql STABLE
  AS $_$
SELECT array_agg(get_object_title(
   id,
   coalesce((select language from localized_texts where language = $2 and thingid = id limit 1), origlang)
))
FROM unnest(ids) as id;
$_$;