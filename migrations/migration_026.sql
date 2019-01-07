-- Create table for legal field
-- This is because fields share yes, no, not applicable, and don't know keys

DROP TABLE IF EXISTS legal_case_field_keys;
CREATE TABLE legal_case_field_keys(
  field TEXT NOT NULL,
  key TEXT NOT NULL,
  ordering INTEGER NOT NULL
);

DROP TABLE IF EXISTS localized_short_values;
CREATE TABLE localized_short_values(
  language TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL
);
INSERT INTO localized_short_values VALUES
  ('en', 'yes', 'Yes'),
  ('en', 'no', 'No'),
  ('en', 'true', 'True'),
  ('en', 'false', 'False'),
  ('en', 'dk', 'Don''t Know'),
  ('en', 'na', 'Not Applicable');

CREATE SEQUENCE value_order;
CREATE FUNCTION insert_fields(field text) RETURNS VOID
  LANGUAGE sql VOLATILE
  AS $_$
    SELECT setval('value_order', 1, FALSE);
    INSERT INTO legal_case_field_keys
    SELECT
      split_part(key, '_value_', 1) AS field,
    	split_part(key, '_value_', 1) || split_part(key, '_value', 2) as key,
    	nextval('value_order') as ordering
    FROM
    	rotate_case_view_localized('en')
    WHERE
     	key LIKE field || '_value_%'
    ;
$_$;

-- Legal Keys for each field
SELECT * from insert_fields('general_issues');
SELECT * from insert_fields('specific_topics');
SELECT * from insert_fields('scope');
SELECT * from insert_fields('time_limited');
SELECT * from insert_fields('purposes');
SELECT * from insert_fields('approaches');
SELECT * from insert_fields('public_spectrum');
SELECT * from insert_fields('open_limited');
SELECT * from insert_fields('recruitment_method');
SELECT * from insert_fields('targeted_participants');
SELECT * from insert_fields('method_types');
SELECT * from insert_fields('tool_types');
INSERT INTO legal_case_field_keys VALUES
  ('legality', 'yes', 1),
  ('legality', 'no', 2),
  ('legality', 'legality_value_dont', 3);
INSERT INTO legal_case_field_keys VALUES
  ('facilitators', 'yes', 1),
  ('facilitators', 'no', 2),
  ('facilitators', 'facilitators_value_na', 3);
SELECT * from insert_fields('facilitator_training');
SELECT * from insert_fields('facetoface_online_or_both');
SELECT * from insert_fields('participants_interactions');
SELECT * from insert_fields('learning_resources');
SELECT * from insert_fields('decision_methods');
SELECT * from insert_fields('if_voting');
SELECT * from insert_fields('insights_outcomes');
SELECT * from insert_fields('organizer_types');
SELECT * from insert_fields('funder_types');
SELECT * from insert_fields('change_types');
SELECT * from insert_fields('implementers_of_change');

DROP TABLE IF EXISTS localized_case_field_values;
CREATE TABLE localized_case_field_values(
  language TEXT NOT NULL,
  key TEXT NOT NULL,
  view TEXT NOT NULL,
  edit TEXT NOT NULL
);
CREATE FUNCTION insert_localized_values(field text) RETURNS VOID
  LANGUAGE sql VOLATILE
  AS $_$
    INSERT INTO localized_case_field_values
    SELECT
      'en' AS language,
    	split_part(view.key, '_value_', 1) || split_part(view.key, '_value', 2) as key,
    	view.value as view,
      edit.value as edit
    FROM
    	rotate_case_view_localized('en') as view,
      rotate_case_view_localized('en') as edit
    WHERE
      view.key = edit.key AND
     	view.key LIKE field || '_value_%'
    ;
$_$;

select * from insert_localized_values('general_issues');
INSERT INTO localized_case_field_values VALUES
  ('en', 'general_issues_human', 'Human Rights & Civil Rights', 'Human Rights & Civil Rights');
INSERT INTO localized_case_field_values
  SELECT
    'en' AS language,
    split_part(view.key, '_value_', 1) || split_part(view.key, '_value', 2) as key,
    view.value as view,
    view.value as edit
  FROM
    rotate_case_view_localized as view
  WHERE
    view.key LIKE 'tool_types_value_%';
select * from insert_localized_values('scope');
select * from insert_localized_values('time_limited');
select * from insert_localized_values('purposes');
select * from insert_localized_values('approaches');
select * from insert_localized_values('public_spectrum');
select * from insert_localized_values('open_limited');
select * from insert_localized_values('recruitment_method');
select * from insert_localized_values('targeted_participants');
select * from insert_localized_values('method_types');
select * from insert_localized_values('tool_types');
select * from insert_localized_values('legality');
select * from insert_localized_values('facilitators');
select * from insert_localized_values('facilitator_training');
select * from insert_localized_values('facetoface_online_or_both');
select * from insert_localized_values('participant_interaction');
select * from insert_localized_values('learning_resources');
select * from insert_localized_values('decision_methods');
select * from insert_localized_values('if_voting');
select * from insert_localized_values('insights_outcomes');
select * from insert_localized_values('organizer_types');
select * from insert_localized_values('funder_types');
select * from insert_localized_values('change_types');
select * from insert_localized_values('implementors_of_change');



DROP SEQUENCE value_order;
DROP FUNCTION insert_fields(TEXT);
DROP FUNCTION insert_localized_values(TEXT);
