-- Take a localization table and return a table of key/value pairs
-- Probably better as a view or materialized view?
CREATE OR REPLACE FUNCTION rotate_table(input table, language text) RETURNS table
  LANGUAGE sql STABLE
  AS $_$
WITH localized as
  (SELECT to_json(input.*) as lookup FROM input WHERE language = language)
select key,value from (select (json_each_text(lookup)).* from localized) as a;
$_$;

update cases set scope_of_influence = 'citytown' where scope_of_influence = 'city/town';
update cases set scope_of_influence = 'regional' where scope_of_influence = 'regional_eg_state_province_autonomous_region';
update cases set time_limited = 'a' where time_limited = 'a_single_defined_period_of_time';
update cases set time_limited = 'repeated' where time_limited = 'repeated_over_time';
update cases set time_limited = '' where time_limited = NULL;
update cases set purposes = array_replace(purposes, 'academic_research', 'academic');
update cases set purposes = array_replace(purposes, 'deliver_goods_and_services_eg_coproduction_of_public_safety_by_police_and_community', 'deliver');
update cases set purposes = array_replace(purposes, 'develop_the_civic_capacities_of_individuals_communities_and/or_civil_society_organizations_eg_increase_understanding_of_public_issues_strengthen_social_capital', 'develop');
update cases set purposes = array_replace(purposes, 'make_influence_or_challenge_decisions_of_government_and_public_bodies', 'make');
update cases set purposes = array_replace(purposes, 'make_influence_or_challenge_decisions_of_private_organizations_eg_civil_society_organizations_corporations', 'make_influence');

update cases set approaches = array_replace(approaches, 'citizenship_building', 'citizenship');
update cases set approaches = array_replace(approaches, 'civil_society_building', 'civil');
update cases set approaches = array_replace(approaches, 'coproduction_in_form_of_partnership_and/or_contract_with_government_and/or_public_bodies', 'coproduction');
update cases set approaches = array_replace(approaches, 'coproduction_in_form_of_partnership_and/or_contract_with_private_organisations', 'coproduction_form');
update cases set approaches = array_replace(approaches, 'direct_decision_making', 'direct');
update cases set approaches = array_replace(approaches, 'independent_action', 'independent');
update cases set approaches = array_replace(approaches, 'informal_engagement_by_intermediaries_with_nongovernmental_authorities', 'informal');
update cases set approaches = array_replace(approaches, 'informal_engagement_by_intermediaries_with_political_authorities','informal_engagement');
update cases set approaches = array_replace(approaches, 'leadership_development', 'leadership');
update cases set approaches = array_replace(approaches, 'oversight_and_social_auditing', 'evaluation');
update cases set approaches = array_replace(approaches, 'research_focus_groups', 'research');
update cases set approaches = array_replace(approaches, 'social_mobilization', 'social');

ALTER TABLE case_view_localized RENAME COLUMN purpose_value_make TO purposes_value_make;
ALTER TABLE case_view_localized RENAME COLUMN purpose_value_make_influence TO purposes_value_make_influence;
ALTER TABLE case_view_localized RENAME COLUMN purpose_value_deliver TO purposes_value_deliver;
ALTER TABLE case_view_localized RENAME COLUMN purpose_value_develop TO purposes_value_develop;
ALTER TABLE case_view_localized RENAME COLUMN purpose_value_academic TO purposes_value_academic;

ALTER TABLE case_view_localized DROP COLUMN IF EXISTS approach_value_;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_advocacy TO approaches_value_advocacy;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_citizenship TO approaches_value_citizenship;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_civil TO approaches_value_civil;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_cogovernance TO approaches_value_cogovernance;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_coproduction TO approaches_value_coproduction;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_coproduction_form TO approaches_value_coproduction_form;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_consultation TO approaches_value_consultation;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_direct TO approaches_value_direct;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_independent TO approaches_value_independent;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_informal TO approaches_value_informal;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_informal_engagement TO approaches_value_informal_engagement;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_leadership TO approaches_value_leadership;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_evaluation TO approaches_value_evaluation;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_protest TO approaches_value_protest;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_research TO approaches_value_research;
ALTER TABLE case_view_localized RENAME COLUMN approach_value_social TO approaches_value_social;
