-- Move methods to new model

-- can't delete tags or location fields becaue they are part of parent model
ALTER TABLE methods DROP COLUMN completeness;
ALTER TABLE methods DROP COLUMN communication_modes CASCADE;
ALTER TABLE methods DROP COLUMN public_interaction_methods;
ALTER TABLE methods DROP COLUMN issue_technical_complexity;
ALTER TABLE methods DROP COLUMN issue_interdependency;
ALTER TABLE methods DROP COLUMN communication_outcomes;
ALTER TABLE methods DROP COLUMN participant_selections;

ALTER TABLE methods ADD COLUMN facetoface_online_or_both TEXT default '';
ALTER TABLE methods ADD COLUMN method_types TEXT[] default '{}';
ALTER TABLE methods ADD COLUMN public_spectrum TEXT default '';
ALTER TABLE methods ADD COLUMN open_limited TEXT default '';
ALTER TABLE methods ADD COLUMN number_of_participants TEXT[] default '{}';
ALTER TABLE methods ADD COLUMN scope_of_influence TEXT[] default '{}';
ALTER TABLE methods ADD COLUMN participants_interactions TEXT[] default '{}';

ALTER TABLE methods ADD COLUMN decision_methods TEXT[] default '{}';
-- populate decision methods
UPDATE methods SET decision_methods = ARRAY[decision_method] where decision_method <> '';
ALTER TABLE methods DROP COLUMN decision_method;

ALTER TABLE methods RENAME COLUMN issue_polarization TO level_polarization;
UPDATE methods SET  level_polarization = 'not_polarized' WHERE level_polarization = '1_not_polarized';
UPDATE methods SET  level_polarization = 'not_polarized' WHERE level_polarization = '1 - Not Polarized';
UPDATE methods SET  level_polarization = 'low_polarization' WHERE level_polarization = '2_not_very_polarized';
UPDATE methods SET  level_polarization = 'low_polarization' WHERE level_polarization = '2 - Not Very Polarized';
UPDATE methods SET  level_polarization = 'moderate_polarization' WHERE level_polarization = '3_somewhate_polarized';
UPDATE methods SET  level_polarization = 'moderate_polarization' WHERE level_polarization = '3 - Somewhat Polarized';
UPDATE methods SET  level_polarization = 'polarized' WHERE level_polarization = '4_polarized';
UPDATE methods SET  level_polarization = 'polarized' WHERE level_polarization = '4 Polarized';
UPDATE methods SET  level_polarization = 'high_polarization' WHERE level_polarization = '5 - Very Polarized';

ALTER TABLE methods DROP COLUMN if_voting;
ALTER TABLE methods ADD COLUMN if_voting TEXT[];

UPDATE methods SET scope_of_influence = ARRAY['international'] WHERE geographical_scope = 'International';
UPDATE methods SET scope_of_influence = ARRAY['international'] WHERE geographical_scope = 'international';
UPDATE methods SET scope_of_influence = ARRAY['local'] WHERE geographical_scope = 'local_eg_neighbourhood_city_town_metropolitan_area';
UPDATE methods SET scope_of_influence = ARRAY['local'] WHERE geographical_scope = 'Local (e.g. Neighbourhood, City/Town, Metropolitan Area)';
UPDATE methods SET scope_of_influence = ARRAY['national'] WHERE geographical_scope = 'National';
UPDATE methods SET scope_of_influence = ARRAY['national'] WHERE geographical_scope = 'national';
UPDATE methods SET scope_of_influence = ARRAY['regional'] WHERE geographical_scope = 'regional_eg_state_province_autonomous_region';
UPDATE methods SET scope_of_influence = ARRAY['regional'] WHERE geographical_scope = 'Regional (e.g. State, Province, Autonomous Region)';

ALTER TABLE methods DROP COLUMN geographical_scope;

ALTER TABLE methods RENAME facilitated TO facilitator;
