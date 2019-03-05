CREATE OR REPLACE FUNCTION get_case_edit_localized_list(language text, field text, keys text[]) RETURNS localized_value[]
    LANGUAGE sql STABLE
    AS $_$
  SELECT COALESCE( array_agg(get_case_edit_localized_value(language, field, key)), '{}') as values from (
    SELECT field, unnest(keys) as key
  ) as a group by field
$_$;
