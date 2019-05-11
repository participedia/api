-- Drop unused functions that still return id,ttile without type
DROP FUNCTION IF EXISTS get_methods(thing cases, language text);
DROP FUNCTION IF EXISTS get_organizations(thing cases, language text);


-- CREATE OR REPLACE FUNCTION get_case_edit_localized_values(field text, language text) RETURNS localized_value[]
--   LANGUAGE sql STABLE
--   AS $_$
-- SELECT array_agg((replace(key, field || '_value_', ''), key, value)::localized_value)
-- FROM (
--   SELECT key, value
--   FROM rotate_case_edit_localized(language)
--   WHERE key LIKE field || '_value_%'
--   ORDER BY key
-- ) as values
-- ;
-- $_$
