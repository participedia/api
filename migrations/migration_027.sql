-- Redo functions to retrieve localized values

-- Get values from the edit localized table, not the view localized table
CREATE OR REPLACE FUNCTION get_case_edit_localized_values(field text, language text) RETURNS localized_value[]
  LANGUAGE sql STABLE
  AS $_$
SELECT array_agg((replace(key, field || '_value_', ''), key, edit)::localized_value)
FROM (
  SELECT key, edit
  FROM localized_case_field_values
  WHERE  language = 'en' AND
    key LIKE field || '_%'
  ORDER BY key
) as values
;
$_$;

DROP FUNCTION IF EXISTS get_case_localized_list_or_null(text, text[], json);
DROP FUNCTION IF EXISTS get_case_localized_list(text, text[], json);
DROP FUNCTION IF EXISTS get_case_localized_value(text, text, json);
DROP FUNCTION IF EXISTS get_case_view_by_id(integer, text, integer);
DROP FUNCTION IF EXISTS get_case_edit_by_id(integer, text, integer);
DROP FUNCTION IF EXISTS get_case_by_id(integer, text, integer);

CREATE OR REPLACE FUNCTION localized_short_value(lang text, key text) RETURNS localized_value
  LANGUAGE sql STABLE
  AS $_$
  SELECT (key, key, vals.value)::localized_value
  FROM localized_short_values AS vals
  WHERE lang = vals.language AND
        key = vals.key
  ;
$_$;

CREATE OR REPLACE FUNCTION only_localized_case_edit_value(lang text, field text, key text) RETURNS localized_value
  LANGUAGE sql STABLE
  AS $_$
  SELECT (key, field || '_' || key, vals.edit)::localized_value
  FROM localized_case_field_values as vals
  WHERE lang = vals.language AND
        field || '_' || key = vals.key
  ;
$_$;

CREATE OR REPLACE FUNCTION only_localized_case_view_value(lang text, field text, key text) RETURNS localized_value
  LANGUAGE sql STABLE
  AS $_$
  SELECT (key, field || '_' || key, vals.view)::localized_value
  FROM localized_case_field_values as vals
  WHERE lang = vals.language AND
        field || '_' || key = vals.key
  ;
$_$;

CREATE OR REPLACE FUNCTION get_case_view_localized_value(language text, field text, key text) RETURNS localized_value
  LANGUAGE sql STABLE
  AS $_$
  SELECT
    CASE
      -- is key in this array?
      WHEN ARRAY[key] <@ ARRAY['yes', 'no', 'true', 'false', 'dk', 'na'] THEN
        localized_short_value(language, key)
      WHEN key = '' then ('', '', '')::localized_value
      ELSE
      only_localized_case_view_value(language, field, key)
    END
    AS value
  ;
$_$;

CREATE OR REPLACE FUNCTION get_case_edit_localized_value(language text, field text, key text) RETURNS localized_value
  LANGUAGE sql STABLE
  AS $_$
  SELECT
    CASE
      -- is key in this array?
      WHEN ARRAY[key] <@ ARRAY['yes', 'no', 'true', 'false', 'dk', 'na'] THEN
        localized_short_value(language, key)
      WHEN key = '' THEN
        ('', '', '')::localized_value
      ELSE
        only_localized_case_edit_value(language, field, key)
    END
    AS value
  ;
$_$;

CREATE OR REPLACE FUNCTION get_case_edit_localized_values(field text, language text) RETURNS localized_value[]
  LANGUAGE sql STABLE
  AS $_$
  SELECT
    array_agg(get_case_view_localized_value(language, field, replace(legal.key, field || '_', '')))::localized_value[]
  FROM
    legal_case_field_keys AS legal
  WHERE
    legal.field = field
  ;
$_$;
