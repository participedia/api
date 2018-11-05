ALTER TABLE case_view_localized RENAME COLUMN legality_value_yes TO yes;
ALTER TABLE case_view_localized DROP COLUMN facilitators_value_yes;
ALTER TABLE case_view_localized RENAME COLUMN legality_value_no TO no;
ALTER TABLE case_view_localized DROP COLUMN facilitators_value_no;
ALTER TABLE case_view_localized RENAME COLUMN scope_value_no TO scope_value_no_geo;
ALTER TABLE case_view_localized RENAME COLUMN participants_interactions_value_no TO participants_interactions_value_no_interaction;
ALTER TABLE case_view_localized RENAME learning_resources_value_no TO learning_resources_value_no_info;

-- Change values for the last three columns in migration 21
