CREATE OR REPLACE FUNCTION get_localized_texts_fallback(id integer, lang text, origlang text) RETURNS localized_texts
  LANGUAGE sql STABLE
  AS $_$
  select * from  get_localized_texts(
    id,
    coalesce(
      (
        select language from localized_texts where language = lang and thingid = id limit 1
      ),
      origlang
    )
  );
$_$;
