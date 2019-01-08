-- Get values from the edit localized table, not the view localized table
CREATE OR REPLACE FUNCTION get_case_edit_localized_values(field text, language text) RETURNS localized_value[]
  LANGUAGE sql STABLE
  AS $_$
SELECT array_agg((replace(key, field || '_value_', ''), key, value)::localized_value)
FROM (
  SELECT key, value
  FROM rotate_case_edit_localized(language)
  WHERE key LIKE field || '_value_%'
  ORDER BY key
) as values
;
$_$


-- update keys to match view data

ALTER TABLE case_edit_localized RENAME COLUMN legality_value_yes TO yes;
ALTER TABLE case_edit_localized DROP COLUMN facilitators_value_yes;
ALTER TABLE case_edit_localized RENAME COLUMN legality_value_no TO no;
ALTER TABLE case_edit_localized DROP COLUMN facilitators_value_no;
ALTER TABLE case_edit_localized ADD COLUMN "false" text DEFAULT 'Localized false';
ALTER TABLE case_edit_localized ADD COLUMN "true" text DEFAULT 'Localized true';
ALTER TABLE case_edit_localized RENAME COLUMN file_upload_label TO files_upload_label ;
ALTER TABLE case_edit_localized RENAME COLUMN file_upload_instructional TO files_upload_instructional ;
ALTER TABLE case_edit_localized RENAME COLUMN file_upload_info TO files_upload_info ;
ALTER TABLE case_edit_localized RENAME COLUMN file_upload_placeholder TO files_upload_placeholder ;
ALTER TABLE case_edit_localized RENAME COLUMN file_link_label TO files_link_label ;
ALTER TABLE case_edit_localized RENAME COLUMN file_link_instructional TO files_link_instructional ;
ALTER TABLE case_edit_localized RENAME COLUMN file_link_info TO files_link_info ;
ALTER TABLE case_edit_localized RENAME COLUMN file_link_placeholder TO files_link_placeholder ;
ALTER TABLE case_edit_localized RENAME COLUMN file_attribution_label TO files_attribution_label ;
ALTER TABLE case_edit_localized RENAME COLUMN file_attribution_instructional TO files_attribution_instructional ;
ALTER TABLE case_edit_localized RENAME COLUMN file_attribution_info TO files_attribution_info ;
ALTER TABLE case_edit_localized RENAME COLUMN file_attribution_placeholder TO files_attribution_placeholder ;
ALTER TABLE case_edit_localized RENAME COLUMN file_title_label TO files_title_label ;
ALTER TABLE case_edit_localized RENAME COLUMN file_title_instructional TO files_title_instructional ;
ALTER TABLE case_edit_localized RENAME COLUMN file_title_info TO files_title_info ;
ALTER TABLE case_edit_localized RENAME COLUMN file_title_placeholder TO files_title_placeholder ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_upload_label TO photos_upload_label ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_upload_instructional TO photos_upload_instructional ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_upload_info TO photos_upload_info ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_upload_placeholder TO photos_upload_placeholder ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_link_label TO photos_link_label ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_link_instructional TO photos_link_instructional ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_link_info TO photos_link_info ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_link_placeholder TO photos_link_placeholder ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_attribution_label TO photos_attribution_label ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_attribution_instructional TO photos_attribution_instructional ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_attribution_info TO photos_attribution_info ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_attribution_placeholder TO photos_attribution_placeholder ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_title_label TO photos_title_label ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_title_instructional TO photos_title_instructional ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_title_info TO photos_title_info ;
ALTER TABLE case_edit_localized RENAME COLUMN photo_title_placeholder TO photos_title_placeholder ;
ALTER TABLE case_edit_localized RENAME COLUMN link_label TO links_label ;
ALTER TABLE case_edit_localized RENAME COLUMN link_instructional TO links_instructional ;
ALTER TABLE case_edit_localized RENAME COLUMN link_info TO links_info ;
ALTER TABLE case_edit_localized RENAME COLUMN link_placeholder TO links_placeholder ;
ALTER TABLE case_edit_localized RENAME COLUMN link_attribution_label TO links_attribution_label ;
ALTER TABLE case_edit_localized RENAME COLUMN link_attribution_instructional TO links_attribution_instructional ;
ALTER TABLE case_edit_localized RENAME COLUMN link_attribution_info TO links_attribution_info ;
ALTER TABLE case_edit_localized RENAME COLUMN link_attribution_placeholder TO links_attribution_placeholder ;
ALTER TABLE case_edit_localized RENAME COLUMN link_title_label TO links_title_label ;
ALTER TABLE case_edit_localized RENAME COLUMN link_title_instructional TO links_title_instructional ;
ALTER TABLE case_edit_localized RENAME COLUMN link_title_info TO links_title_info ;
ALTER TABLE case_edit_localized RENAME COLUMN link_title_placeholder TO links_title_placeholder ;
ALTER TABLE case_edit_localized RENAME COLUMN video_link_label TO videos_link_label ;
ALTER TABLE case_edit_localized RENAME COLUMN video_link_instructional TO videos_link_instructional ;
ALTER TABLE case_edit_localized RENAME COLUMN video_link_info TO videos_link_info ;
ALTER TABLE case_edit_localized RENAME COLUMN video_link_placeholder TO videos_link_placeholder ;
ALTER TABLE case_edit_localized RENAME COLUMN video_attribution_label TO videos_attribution_label ;
ALTER TABLE case_edit_localized RENAME COLUMN video_attribution_instructional TO videos_attribution_instructional ;
ALTER TABLE case_edit_localized RENAME COLUMN video_attribution_info TO videos_attribution_info ;
ALTER TABLE case_edit_localized RENAME COLUMN video_attribution_placeholder TO videos_attribution_placeholder ;
ALTER TABLE case_edit_localized RENAME COLUMN video_title_label TO videos_title_label ;
ALTER TABLE case_edit_localized RENAME COLUMN video_title_instructional TO videos_title_instructional ;
ALTER TABLE case_edit_localized RENAME COLUMN video_title_info TO videos_title_info ;
ALTER TABLE case_edit_localized RENAME COLUMN video_title_placeholder TO videos_title_placeholder ;

-- Add General Issues values
ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_agriculture text DEFAULT 'Localized general_issues_value_agriculture';
UPDATE case_edit_localized SET general_issues_value_agriculture = 'Agriculture, Forestry, Fishing & Mining Industries';
ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_arts text DEFAULT 'Localized general_issues_value_arts';
UPDATE case_edit_localized SET general_issues_value_arts = 'Arts, Culture, & Recreation';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_business text DEFAULT 'Localized general_issues_value_business';
UPDATE case_edit_localized SET general_issues_value_business = 'Business';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_economics text DEFAULT 'Localized general_issues_value_economics';
UPDATE case_edit_localized SET general_issues_value_economics = 'Economics';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_education text DEFAULT 'Localized general_issues_value_education';
UPDATE case_edit_localized SET general_issues_value_education = 'Education';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_energy text DEFAULT 'Localized general_issues_value_energy';
UPDATE case_edit_localized SET general_issues_value_energy = 'Energy';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_environment text DEFAULT 'Localized general_issues_value_environment';
UPDATE case_edit_localized SET general_issues_value_environment = 'Environment';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_governance text DEFAULT 'Localized general_issues_value_governance';
UPDATE case_edit_localized SET general_issues_value_governance = 'Governance & Political Institutions';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_health text DEFAULT 'Localized general_issues_value_health';
UPDATE case_edit_localized SET general_issues_value_health = 'Health';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_housing text DEFAULT 'Localized general_issues_value_housing';
UPDATE case_edit_localized SET general_issues_value_housing = 'Housing';

ALTER TABLE case_edit_localized ADD COLUMN case_edit_localized text DEFAULT 'Localized case_edit_localized';
UPDATE case_edit_localized SET case_edit_localized = 'Human Rights & Civil Rights';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_identity text DEFAULT 'Localized general_issues_value_identity';
UPDATE case_edit_localized SET general_issues_value_identity = 'Identity & Diversity';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_immigration text DEFAULT 'Localized general_issues_value_immigration';
UPDATE case_edit_localized SET general_issues_value_immigration = 'Immigration & Migration';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_international text DEFAULT 'Localized general_issues_value_international';
UPDATE case_edit_localized SET general_issues_value_international = 'International Affairs';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_labor text DEFAULT 'Localized general_issues_value_labor';
UPDATE case_edit_localized SET general_issues_value_labor = 'Labor & Work';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_law text DEFAULT 'Localized general_issues_value_law';
UPDATE case_edit_localized SET general_issues_value_law = 'Law Enforcement, Criminal Justice & Corrections';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_media text DEFAULT 'Localized general_issues_value_media';
UPDATE case_edit_localized SET general_issues_value_media = 'Media, Telecommunications & Information';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_national text DEFAULT 'Localized general_issues_value_national';
UPDATE case_edit_localized SET general_issues_value_national = 'National Security';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_planning text DEFAULT 'Localized general_issues_value_planning';
UPDATE case_edit_localized SET general_issues_value_planning = 'Planning & Development';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_science text DEFAULT 'Localized general_issues_value_science';
UPDATE case_edit_localized SET general_issues_value_science = 'Science & Technology';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_social text DEFAULT 'Localized general_issues_value_social';
UPDATE case_edit_localized SET general_issues_value_social = 'Social Welfare';

ALTER TABLE case_edit_localized ADD COLUMN general_issues_value_transportation text DEFAULT 'Localized general_issues_value_transportation';
UPDATE case_edit_localized SET general_issues_value_transportation = 'Transportation';

-- Add specific issues values

ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_abilitydisability text DEFAULT 'Localized specific_topics_value_abilitydisability';
UPDATE case_edit_localized SET specific_topics_value_abilitydisability = 'Ability/Disability Issues';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_abortion text DEFAULT 'Localized specific_topics_value_abortion';
UPDATE case_edit_localized SET specific_topics_value_abortion = 'Abortion';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_access text DEFAULT 'Localized specific_topics_value_access';
UPDATE case_edit_localized SET specific_topics_value_access = 'Access to Radio & Television Frequencies';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_addiction text DEFAULT 'Localized specific_topics_value_addiction';
UPDATE case_edit_localized SET specific_topics_value_addiction = 'Addiction Treatment & Management';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_administration text DEFAULT 'Localized specific_topics_value_administration';
UPDATE case_edit_localized SET specific_topics_value_administration = 'Administration of Campaigns and Elections';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_affordable text DEFAULT 'Localized specific_topics_value_affordable';
UPDATE case_edit_localized SET specific_topics_value_affordable = 'Affordable Housing';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_age text DEFAULT 'Localized specific_topics_value_age';
UPDATE case_edit_localized SET specific_topics_value_age = 'Age Discrimination';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_aging text DEFAULT 'Localized specific_topics_value_aging';
UPDATE case_edit_localized SET specific_topics_value_aging = 'Aging';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_aging_issues text DEFAULT 'Localized specific_topics_value_aging_issues';
UPDATE case_edit_localized SET specific_topics_value_aging_issues = 'Aging Issues';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_agricultural text DEFAULT 'Localized specific_topics_value_agricultural';
UPDATE case_edit_localized SET specific_topics_value_agricultural = 'Agricultural Biotechnology';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_air text DEFAULT 'Localized specific_topics_value_air';
UPDATE case_edit_localized SET specific_topics_value_air = 'Air Quality';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_air_travel text DEFAULT 'Localized specific_topics_value_air_travel';
UPDATE case_edit_localized SET specific_topics_value_air_travel = 'Air Travel';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_alternative text DEFAULT 'Localized specific_topics_value_alternative';
UPDATE case_edit_localized SET specific_topics_value_alternative = 'Alternative & Renewable Energy';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_alternative_education text DEFAULT 'Localized specific_topics_value_alternative_education';
UPDATE case_edit_localized SET specific_topics_value_alternative_education = 'Alternative Education';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_animal text DEFAULT 'Localized specific_topics_value_animal';
UPDATE case_edit_localized SET specific_topics_value_animal = 'Animal Welfare';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_arms text DEFAULT 'Localized specific_topics_value_arms';
UPDATE case_edit_localized SET specific_topics_value_arms = 'Arms Control';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_artificial text DEFAULT 'Localized specific_topics_value_artificial';
UPDATE case_edit_localized SET specific_topics_value_artificial = 'Artificial Intelligence';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_bankruptcy text DEFAULT 'Localized specific_topics_value_bankruptcy';
UPDATE case_edit_localized SET specific_topics_value_bankruptcy = 'Bankruptcy';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_biomedical text DEFAULT 'Localized specific_topics_value_biomedical';
UPDATE case_edit_localized SET specific_topics_value_biomedical = 'Biomedical Research & Development';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_birth text DEFAULT 'Localized specific_topics_value_birth';
UPDATE case_edit_localized SET specific_topics_value_birth = 'Birth Control';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_budget text DEFAULT 'Localized specific_topics_value_budget';
UPDATE case_edit_localized SET specific_topics_value_budget = 'Budget - Local';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_budget_national text DEFAULT 'Localized specific_topics_value_budget_national';
UPDATE case_edit_localized SET specific_topics_value_budget_national = 'Budget - National';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_budget_provincial text DEFAULT 'Localized specific_topics_value_budget_provincial';
UPDATE case_edit_localized SET specific_topics_value_budget_provincial = 'Budget - Provincial, Regional, State';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_bureaucracy text DEFAULT 'Localized specific_topics_value_bureaucracy';
UPDATE case_edit_localized SET specific_topics_value_bureaucracy = 'Bureaucracy';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_carbon text DEFAULT 'Localized specific_topics_value_carbon';
UPDATE case_edit_localized SET specific_topics_value_carbon = 'Carbon Capture & Sequestration';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_censorship text DEFAULT 'Localized specific_topics_value_censorship';
UPDATE case_edit_localized SET specific_topics_value_censorship = 'Censorship';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_child text DEFAULT 'Localized specific_topics_value_child';
UPDATE case_edit_localized SET specific_topics_value_child = 'Child Care';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_citizenship text DEFAULT 'Localized specific_topics_value_citizenship';
UPDATE case_edit_localized SET specific_topics_value_citizenship = 'Citizenship & Role of Citizens';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_civil text DEFAULT 'Localized specific_topics_value_civil';
UPDATE case_edit_localized SET specific_topics_value_civil = 'Civil Law';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_climate text DEFAULT 'Localized specific_topics_value_climate';
UPDATE case_edit_localized SET specific_topics_value_climate = 'Climate Change';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_coal text DEFAULT 'Localized specific_topics_value_coal';
UPDATE case_edit_localized SET specific_topics_value_coal = 'Coal';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_cohousing text DEFAULT 'Localized specific_topics_value_cohousing';
UPDATE case_edit_localized SET specific_topics_value_cohousing = 'Cohousing';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_community text DEFAULT 'Localized specific_topics_value_community';
UPDATE case_edit_localized SET specific_topics_value_community = 'Community & Police Relations';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_community_resettlement text DEFAULT 'Localized specific_topics_value_community_resettlement';
UPDATE case_edit_localized SET specific_topics_value_community_resettlement = 'Community Resettlement';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_concentration text DEFAULT 'Localized specific_topics_value_concentration';
UPDATE case_edit_localized SET specific_topics_value_concentration = 'Concentration of Media Ownership';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_constitutional text DEFAULT 'Localized specific_topics_value_constitutional';
UPDATE case_edit_localized SET specific_topics_value_constitutional = 'Constitutional Reform';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_consumer text DEFAULT 'Localized specific_topics_value_consumer';
UPDATE case_edit_localized SET specific_topics_value_consumer = 'Consumer Protection';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_copyrights text DEFAULT 'Localized specific_topics_value_copyrights';
UPDATE case_edit_localized SET specific_topics_value_copyrights = 'Copyrights & Patents';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_corporate text DEFAULT 'Localized specific_topics_value_corporate';
UPDATE case_edit_localized SET specific_topics_value_corporate = 'Corporate Subsidies';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_court text DEFAULT 'Localized specific_topics_value_court';
UPDATE case_edit_localized SET specific_topics_value_court = 'Court Systems';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_criminal text DEFAULT 'Localized specific_topics_value_criminal';
UPDATE case_edit_localized SET specific_topics_value_criminal = 'Criminal Law';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_cultural text DEFAULT 'Localized specific_topics_value_cultural';
UPDATE case_edit_localized SET specific_topics_value_cultural = 'Cultural Assimilation or Integration';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_curriculum text DEFAULT 'Localized specific_topics_value_curriculum';
UPDATE case_edit_localized SET specific_topics_value_curriculum = 'Curriculum & Standards';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_cyber text DEFAULT 'Localized specific_topics_value_cyber';
UPDATE case_edit_localized SET specific_topics_value_cyber = 'Cyber Security';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_cycling text DEFAULT 'Localized specific_topics_value_cycling';
UPDATE case_edit_localized SET specific_topics_value_cycling = 'Cycling';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_diplomacy text DEFAULT 'Localized specific_topics_value_diplomacy';
UPDATE case_edit_localized SET specific_topics_value_diplomacy = 'Diplomacy';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_disability text DEFAULT 'Localized specific_topics_value_disability';
UPDATE case_edit_localized SET specific_topics_value_disability = 'Disability Rights';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_disabled text DEFAULT 'Localized specific_topics_value_disabled';
UPDATE case_edit_localized SET specific_topics_value_disabled = 'Disabled Assistance';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_disaster text DEFAULT 'Localized specific_topics_value_disaster';
UPDATE case_edit_localized SET specific_topics_value_disaster = 'Disaster Preparedness';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_disease text DEFAULT 'Localized specific_topics_value_disease';
UPDATE case_edit_localized SET specific_topics_value_disease = 'Disease Prevention';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_drug text DEFAULT 'Localized specific_topics_value_drug';
UPDATE case_edit_localized SET specific_topics_value_drug = 'Drug Coverage & Cost';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_drug_testing text DEFAULT 'Localized specific_topics_value_drug_testing';
UPDATE case_edit_localized SET specific_topics_value_drug_testing = 'Drug Testing & Regulation';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_early text DEFAULT 'Localized specific_topics_value_early';
UPDATE case_edit_localized SET specific_topics_value_early = 'Early Childhood Education';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_ecohousing text DEFAULT 'Localized specific_topics_value_ecohousing';
UPDATE case_edit_localized SET specific_topics_value_ecohousing = 'Eco-Housing';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_economic text DEFAULT 'Localized specific_topics_value_economic';
UPDATE case_edit_localized SET specific_topics_value_economic = 'Economic Development';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_economic_inequality text DEFAULT 'Localized specific_topics_value_economic_inequality';
UPDATE case_edit_localized SET specific_topics_value_economic_inequality = 'Economic Inequality';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_elderly text DEFAULT 'Localized specific_topics_value_elderly';
UPDATE case_edit_localized SET specific_topics_value_elderly = 'Elderly Assistance';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_elderly_housing text DEFAULT 'Localized specific_topics_value_elderly_housing';
UPDATE case_edit_localized SET specific_topics_value_elderly_housing = 'Elderly Housing';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_electricity text DEFAULT 'Localized specific_topics_value_electricity';
UPDATE case_edit_localized SET specific_topics_value_electricity = 'Electricity';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_elementary text DEFAULT 'Localized specific_topics_value_elementary';
UPDATE case_edit_localized SET specific_topics_value_elementary = 'Elementary & Secondary Education';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_employee text DEFAULT 'Localized specific_topics_value_employee';
UPDATE case_edit_localized SET specific_topics_value_employee = 'Employee Benefits';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_energy text DEFAULT 'Localized specific_topics_value_energy';
UPDATE case_edit_localized SET specific_topics_value_energy = 'Energy Conservation';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_energy_efficiency text DEFAULT 'Localized specific_topics_value_energy_efficiency';
UPDATE case_edit_localized SET specific_topics_value_energy_efficiency = 'Energy Efficiency & Storage';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_energy_siting text DEFAULT 'Localized specific_topics_value_energy_siting';
UPDATE case_edit_localized SET specific_topics_value_energy_siting = 'Energy Siting & Transmission';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_environmental text DEFAULT 'Localized specific_topics_value_environmental';
UPDATE case_edit_localized SET specific_topics_value_environmental = 'Environmental Conservation';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_ethnicracial text DEFAULT 'Localized specific_topics_value_ethnicracial';
UPDATE case_edit_localized SET specific_topics_value_ethnicracial = 'Ethnic/Racial Equality & Equity';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_ethnicracial_relations text DEFAULT 'Localized specific_topics_value_ethnicracial_relations';
UPDATE case_edit_localized SET specific_topics_value_ethnicracial_relations = 'Ethnic/Racial Relations';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_fair text DEFAULT 'Localized specific_topics_value_fair';
UPDATE case_edit_localized SET specific_topics_value_fair = 'Fair Labor Standards';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_financing text DEFAULT 'Localized specific_topics_value_financing';
UPDATE case_edit_localized SET specific_topics_value_financing = 'Financing of Political Campaigns';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_fisheries text DEFAULT 'Localized specific_topics_value_fisheries';
UPDATE case_edit_localized SET specific_topics_value_fisheries = 'Fisheries & Fishing';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_food text DEFAULT 'Localized specific_topics_value_food';
UPDATE case_edit_localized SET specific_topics_value_food = 'Food & Nutrition';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_food_assistance text DEFAULT 'Localized specific_topics_value_food_assistance';
UPDATE case_edit_localized SET specific_topics_value_food_assistance = 'Food Assistance';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_food_inspection text DEFAULT 'Localized specific_topics_value_food_inspection';
UPDATE case_edit_localized SET specific_topics_value_food_inspection = 'Food Inspection & Safety';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_foreign text DEFAULT 'Localized specific_topics_value_foreign';
UPDATE case_edit_localized SET specific_topics_value_foreign = 'Foreign Aid';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_freedom text DEFAULT 'Localized specific_topics_value_freedom';
UPDATE case_edit_localized SET specific_topics_value_freedom = 'Freedom of Information';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_freedom_of text DEFAULT 'Localized specific_topics_value_freedom_of';
UPDATE case_edit_localized SET specific_topics_value_freedom_of = 'Freedom of Speech';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_funding text DEFAULT 'Localized specific_topics_value_funding';
UPDATE case_edit_localized SET specific_topics_value_funding = 'Funding';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_gender text DEFAULT 'Localized specific_topics_value_gender';
UPDATE case_edit_localized SET specific_topics_value_gender = 'Gender Equality & Equity';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_gender_identity text DEFAULT 'Localized specific_topics_value_gender_identity';
UPDATE case_edit_localized SET specific_topics_value_gender_identity = 'Gender Identity';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_geopolitics text DEFAULT 'Localized specific_topics_value_geopolitics';
UPDATE case_edit_localized SET specific_topics_value_geopolitics = 'Geopolitics';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_geotechnology text DEFAULT 'Localized specific_topics_value_geotechnology';
UPDATE case_edit_localized SET specific_topics_value_geotechnology = 'Geotechnology';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_government text DEFAULT 'Localized specific_topics_value_government';
UPDATE case_edit_localized SET specific_topics_value_government = 'Government Corruption';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_government_funding text DEFAULT 'Localized specific_topics_value_government_funding';
UPDATE case_edit_localized SET specific_topics_value_government_funding = 'Government Funding of Education';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_government_spending text DEFAULT 'Localized specific_topics_value_government_spending';
UPDATE case_edit_localized SET specific_topics_value_government_spending = 'Government Spending';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_government_subsidies text DEFAULT 'Localized specific_topics_value_government_subsidies';
UPDATE case_edit_localized SET specific_topics_value_government_subsidies = 'Government Subsidies';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_government_transparency text DEFAULT 'Localized specific_topics_value_government_transparency';
UPDATE case_edit_localized SET specific_topics_value_government_transparency = 'Government Transparency';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_hazardous text DEFAULT 'Localized specific_topics_value_hazardous';
UPDATE case_edit_localized SET specific_topics_value_hazardous = 'Hazardous Waste';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_health text DEFAULT 'Localized specific_topics_value_health';
UPDATE case_edit_localized SET specific_topics_value_health = 'Health Care Reform';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_health_insurance text DEFAULT 'Localized specific_topics_value_health_insurance';
UPDATE case_edit_localized SET specific_topics_value_health_insurance = 'Health Insurance';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_higher text DEFAULT 'Localized specific_topics_value_higher';
UPDATE case_edit_localized SET specific_topics_value_higher = 'Higher Education';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_highway text DEFAULT 'Localized specific_topics_value_highway';
UPDATE case_edit_localized SET specific_topics_value_highway = 'Highway Safety';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_homelessness text DEFAULT 'Localized specific_topics_value_homelessness';
UPDATE case_edit_localized SET specific_topics_value_homelessness = 'Homelessness';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_housing text DEFAULT 'Localized specific_topics_value_housing';
UPDATE case_edit_localized SET specific_topics_value_housing = 'Housing Planning';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_human text DEFAULT 'Localized specific_topics_value_human';
UPDATE case_edit_localized SET specific_topics_value_human = 'Human Rights';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_human_trafficking text DEFAULT 'Localized specific_topics_value_human_trafficking';
UPDATE case_edit_localized SET specific_topics_value_human_trafficking = 'Human Trafficking';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_identity text DEFAULT 'Localized specific_topics_value_identity';
UPDATE case_edit_localized SET specific_topics_value_identity = 'Identity Politics';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_immigration text DEFAULT 'Localized specific_topics_value_immigration';
UPDATE case_edit_localized SET specific_topics_value_immigration = 'Immigration';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_indigenous text DEFAULT 'Localized specific_topics_value_indigenous';
UPDATE case_edit_localized SET specific_topics_value_indigenous = 'Indigenous Issues';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_indigenous_planning text DEFAULT 'Localized specific_topics_value_indigenous_planning';
UPDATE case_edit_localized SET specific_topics_value_indigenous_planning = 'Indigenous Planning';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_industrial text DEFAULT 'Localized specific_topics_value_industrial';
UPDATE case_edit_localized SET specific_topics_value_industrial = 'Industrial Policy';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_industrial_siting text DEFAULT 'Localized specific_topics_value_industrial_siting';
UPDATE case_edit_localized SET specific_topics_value_industrial_siting = 'Industrial Siting Guidelines';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_information text DEFAULT 'Localized specific_topics_value_information';
UPDATE case_edit_localized SET specific_topics_value_information = 'Information & Communications Technology';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_infrastructure text DEFAULT 'Localized specific_topics_value_infrastructure';
UPDATE case_edit_localized SET specific_topics_value_infrastructure = 'Infrastructure';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_intellectual text DEFAULT 'Localized specific_topics_value_intellectual';
UPDATE case_edit_localized SET specific_topics_value_intellectual = 'Intellectual Property Rights';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_intelligence text DEFAULT 'Localized specific_topics_value_intelligence';
UPDATE case_edit_localized SET specific_topics_value_intelligence = 'Intelligence Gathering';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_intergovernmental text DEFAULT 'Localized specific_topics_value_intergovernmental';
UPDATE case_edit_localized SET specific_topics_value_intergovernmental = 'Intergovernmental Relations';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_international text DEFAULT 'Localized specific_topics_value_international';
UPDATE case_edit_localized SET specific_topics_value_international = 'International Law';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_internet text DEFAULT 'Localized specific_topics_value_internet';
UPDATE case_edit_localized SET specific_topics_value_internet = 'Internet Access';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_internet_governance text DEFAULT 'Localized specific_topics_value_internet_governance';
UPDATE case_edit_localized SET specific_topics_value_internet_governance = 'Internet Governance';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_jails text DEFAULT 'Localized specific_topics_value_jails';
UPDATE case_edit_localized SET specific_topics_value_jails = 'Jails and Prisons';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_judicial text DEFAULT 'Localized specific_topics_value_judicial';
UPDATE case_edit_localized SET specific_topics_value_judicial = 'Judicial Reform';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_labor text DEFAULT 'Localized specific_topics_value_labor';
UPDATE case_edit_localized SET specific_topics_value_labor = 'Labor Unions';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_land text DEFAULT 'Localized specific_topics_value_land';
UPDATE case_edit_localized SET specific_topics_value_land = 'Land Use';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_lgbtq text DEFAULT 'Localized specific_topics_value_lgbtq';
UPDATE case_edit_localized SET specific_topics_value_lgbtq = 'LGBTQ Issues';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_libraries text DEFAULT 'Localized specific_topics_value_libraries';
UPDATE case_edit_localized SET specific_topics_value_libraries = 'Libraries';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_longterm text DEFAULT 'Localized specific_topics_value_longterm';
UPDATE case_edit_localized SET specific_topics_value_longterm = 'Long-Term Care';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_lowincome text DEFAULT 'Localized specific_topics_value_lowincome';
UPDATE case_edit_localized SET specific_topics_value_lowincome = 'Low-income Assistance';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_maritime text DEFAULT 'Localized specific_topics_value_maritime';
UPDATE case_edit_localized SET specific_topics_value_maritime = 'Maritime';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_masspublic text DEFAULT 'Localized specific_topics_value_masspublic';
UPDATE case_edit_localized SET specific_topics_value_masspublic = 'Mass/Public Transport';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_medical text DEFAULT 'Localized specific_topics_value_medical';
UPDATE case_edit_localized SET specific_topics_value_medical = 'Medical Liability';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_mental text DEFAULT 'Localized specific_topics_value_mental';
UPDATE case_edit_localized SET specific_topics_value_mental = 'Mental Health';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_migrant text DEFAULT 'Localized specific_topics_value_migrant';
UPDATE case_edit_localized SET specific_topics_value_migrant = 'Migrant and Seasonal Labor';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_military text DEFAULT 'Localized specific_topics_value_military';
UPDATE case_edit_localized SET specific_topics_value_military = 'Military and Defense';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_monetary text DEFAULT 'Localized specific_topics_value_monetary';
UPDATE case_edit_localized SET specific_topics_value_monetary = 'Monetary Policy';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_museums text DEFAULT 'Localized specific_topics_value_museums';
UPDATE case_edit_localized SET specific_topics_value_museums = 'Museums';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_nanotechnology text DEFAULT 'Localized specific_topics_value_nanotechnology';
UPDATE case_edit_localized SET specific_topics_value_nanotechnology = 'Nanotechnology';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_natural text DEFAULT 'Localized specific_topics_value_natural';
UPDATE case_edit_localized SET specific_topics_value_natural = 'Natural Gas & Oil';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_natural_resource text DEFAULT 'Localized specific_topics_value_natural_resource';
UPDATE case_edit_localized SET specific_topics_value_natural_resource = 'Natural Resource Management';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_nuclear text DEFAULT 'Localized specific_topics_value_nuclear';
UPDATE case_edit_localized SET specific_topics_value_nuclear = 'Nuclear Energy';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_open text DEFAULT 'Localized specific_topics_value_open';
UPDATE case_edit_localized SET specific_topics_value_open = 'Open Data';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_pensions text DEFAULT 'Localized specific_topics_value_pensions';
UPDATE case_edit_localized SET specific_topics_value_pensions = 'Pensions & Retirement';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_police text DEFAULT 'Localized specific_topics_value_police';
UPDATE case_edit_localized SET specific_topics_value_police = 'Police';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_political text DEFAULT 'Localized specific_topics_value_political';
UPDATE case_edit_localized SET specific_topics_value_political = 'Political Parties';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_political_rights text DEFAULT 'Localized specific_topics_value_political_rights';
UPDATE case_edit_localized SET specific_topics_value_political_rights = 'Political Rights';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_poverty text DEFAULT 'Localized specific_topics_value_poverty';
UPDATE case_edit_localized SET specific_topics_value_poverty = 'Poverty';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_public text DEFAULT 'Localized specific_topics_value_public';
UPDATE case_edit_localized SET specific_topics_value_public = 'Public Amenities';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_public_art text DEFAULT 'Localized specific_topics_value_public_art';
UPDATE case_edit_localized SET specific_topics_value_public_art = 'Public Art';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_public_participation text DEFAULT 'Localized specific_topics_value_public_participation';
UPDATE case_edit_localized SET specific_topics_value_public_participation = 'Public Participation';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_public_safety text DEFAULT 'Localized specific_topics_value_public_safety';
UPDATE case_edit_localized SET specific_topics_value_public_safety = 'Public Safety';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_quality text DEFAULT 'Localized specific_topics_value_quality';
UPDATE case_edit_localized SET specific_topics_value_quality = 'Quality of Health Care';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_railroads text DEFAULT 'Localized specific_topics_value_railroads';
UPDATE case_edit_localized SET specific_topics_value_railroads = 'Railroads';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_recycling text DEFAULT 'Localized specific_topics_value_recycling';
UPDATE case_edit_localized SET specific_topics_value_recycling = 'Recycling';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_refugee text DEFAULT 'Localized specific_topics_value_refugee';
UPDATE case_edit_localized SET specific_topics_value_refugee = 'Refugee Resettlement';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_refugee_rights text DEFAULT 'Localized specific_topics_value_refugee_rights';
UPDATE case_edit_localized SET specific_topics_value_refugee_rights = 'Refugee Rights';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_regional text DEFAULT 'Localized specific_topics_value_regional';
UPDATE case_edit_localized SET specific_topics_value_regional = 'Regional & Global Governance';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_regionalism text DEFAULT 'Localized specific_topics_value_regionalism';
UPDATE case_edit_localized SET specific_topics_value_regionalism = 'Regionalism';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_regulation text DEFAULT 'Localized specific_topics_value_regulation';
UPDATE case_edit_localized SET specific_topics_value_regulation = 'Regulation';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_regulatory text DEFAULT 'Localized specific_topics_value_regulatory';
UPDATE case_edit_localized SET specific_topics_value_regulatory = 'Regulatory Policy';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_religious text DEFAULT 'Localized specific_topics_value_religious';
UPDATE case_edit_localized SET specific_topics_value_religious = 'Religious Rights';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_research text DEFAULT 'Localized specific_topics_value_research';
UPDATE case_edit_localized SET specific_topics_value_research = 'Research & Development';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_resilience text DEFAULT 'Localized specific_topics_value_resilience';
UPDATE case_edit_localized SET specific_topics_value_resilience = 'Resilience Planning & Design';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_right text DEFAULT 'Localized specific_topics_value_right';
UPDATE case_edit_localized SET specific_topics_value_right = 'Right to Adequate Housing';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_right_to text DEFAULT 'Localized specific_topics_value_right_to';
UPDATE case_edit_localized SET specific_topics_value_right_to = 'Right to Representation';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_roads text DEFAULT 'Localized specific_topics_value_roads';
UPDATE case_edit_localized SET specific_topics_value_roads = 'Roads and Highways';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_rural text DEFAULT 'Localized specific_topics_value_rural';
UPDATE case_edit_localized SET specific_topics_value_rural = 'Rural Housing';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_school text DEFAULT 'Localized specific_topics_value_school';
UPDATE case_edit_localized SET specific_topics_value_school = 'School Governance';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_selfdriving text DEFAULT 'Localized specific_topics_value_selfdriving';
UPDATE case_edit_localized SET specific_topics_value_selfdriving = 'Self-Driving Vehicles';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_sentencing text DEFAULT 'Localized specific_topics_value_sentencing';
UPDATE case_edit_localized SET specific_topics_value_sentencing = 'Sentencing Guidelines';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_social text DEFAULT 'Localized specific_topics_value_social';
UPDATE case_edit_localized SET specific_topics_value_social = 'Social Determinants of Health';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_space text DEFAULT 'Localized specific_topics_value_space';
UPDATE case_edit_localized SET specific_topics_value_space = 'Space Exploration';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_special text DEFAULT 'Localized specific_topics_value_special';
UPDATE case_edit_localized SET specific_topics_value_special = 'Special Education';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_species text DEFAULT 'Localized specific_topics_value_species';
UPDATE case_edit_localized SET specific_topics_value_species = 'Species Protection';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_sports text DEFAULT 'Localized specific_topics_value_sports';
UPDATE case_edit_localized SET specific_topics_value_sports = 'Sports';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_substance text DEFAULT 'Localized specific_topics_value_substance';
UPDATE case_edit_localized SET specific_topics_value_substance = 'Substance Abuse';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_sustainable text DEFAULT 'Localized specific_topics_value_sustainable';
UPDATE case_edit_localized SET specific_topics_value_sustainable = 'Sustainable Development';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_taxation text DEFAULT 'Localized specific_topics_value_taxation';
UPDATE case_edit_localized SET specific_topics_value_taxation = 'Taxation';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_teacher text DEFAULT 'Localized specific_topics_value_teacher';
UPDATE case_edit_localized SET specific_topics_value_teacher = 'Teacher Training & Accountability';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_telephone text DEFAULT 'Localized specific_topics_value_telephone';
UPDATE case_edit_localized SET specific_topics_value_telephone = 'Telephone Access';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_terrorism text DEFAULT 'Localized specific_topics_value_terrorism';
UPDATE case_edit_localized SET specific_topics_value_terrorism = 'Terrorism';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_torture text DEFAULT 'Localized specific_topics_value_torture';
UPDATE case_edit_localized SET specific_topics_value_torture = 'Torture';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_tourism text DEFAULT 'Localized specific_topics_value_tourism';
UPDATE case_edit_localized SET specific_topics_value_tourism = 'Tourism';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_trade text DEFAULT 'Localized specific_topics_value_trade';
UPDATE case_edit_localized SET specific_topics_value_trade = 'Trade and Tariffs';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_transparency text DEFAULT 'Localized specific_topics_value_transparency';
UPDATE case_edit_localized SET specific_topics_value_transparency = 'Transparency';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_transportation text DEFAULT 'Localized specific_topics_value_transportation';
UPDATE case_edit_localized SET specific_topics_value_transportation = 'Transportation Planning';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_treaties text DEFAULT 'Localized specific_topics_value_treaties';
UPDATE case_edit_localized SET specific_topics_value_treaties = 'Treaties';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_unemployment text DEFAULT 'Localized specific_topics_value_unemployment';
UPDATE case_edit_localized SET specific_topics_value_unemployment = 'Unemployment';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_unofficial text DEFAULT 'Localized specific_topics_value_unofficial';
UPDATE case_edit_localized SET specific_topics_value_unofficial = 'Unofficial (Track II) Diplomacy';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_vocational text DEFAULT 'Localized specific_topics_value_vocational';
UPDATE case_edit_localized SET specific_topics_value_vocational = 'Vocational Education & Training';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_wage text DEFAULT 'Localized specific_topics_value_wage';
UPDATE case_edit_localized SET specific_topics_value_wage = 'Wage Standards';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_walkingpedestrian text DEFAULT 'Localized specific_topics_value_walkingpedestrian';
UPDATE case_edit_localized SET specific_topics_value_walkingpedestrian = 'Walking/Pedestrian Mobility';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_waste text DEFAULT 'Localized specific_topics_value_waste';
UPDATE case_edit_localized SET specific_topics_value_waste = 'Waste Disposal';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_water text DEFAULT 'Localized specific_topics_value_water';
UPDATE case_edit_localized SET specific_topics_value_water = 'Water Quality';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_weather text DEFAULT 'Localized specific_topics_value_weather';
UPDATE case_edit_localized SET specific_topics_value_weather = 'Weather Forecasting';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_wilderness text DEFAULT 'Localized specific_topics_value_wilderness';
UPDATE case_edit_localized SET specific_topics_value_wilderness = 'Wilderness Protection';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_worker text DEFAULT 'Localized specific_topics_value_worker';
UPDATE case_edit_localized SET specific_topics_value_worker = 'Worker Health & Safety';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_workforce text DEFAULT 'Localized specific_topics_value_workforce';
UPDATE case_edit_localized SET specific_topics_value_workforce = 'Workforce Education';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_youth text DEFAULT 'Localized specific_topics_value_youth';
UPDATE case_edit_localized SET specific_topics_value_youth = 'Youth Employment';
ALTER TABLE case_edit_localized ADD COLUMN specific_topics_value_youth_issues text DEFAULT 'Localized specific_topics_value_youth_issues';
UPDATE case_edit_localized SET specific_topics_value_youth_issues = 'Youth Issues';

-- Sometimes the names in edit table make more sense, but then I have to change all the values too. Ugh.
ALTER TABLE case_edit_localized RENAME COLUMN time_limited_value_single TO time_limited_value_a;
ALTER TABLE case_edit_localized RENAME COLUMN scope_value_city TO "scope_value_city/town";
ALTER TABLE case_edit_localized RENAME COLUMN scope_value_no_limit TO scope_value_no_geo;
ALTER TABLE case_edit_localized RENAME COLUMN purpose_value_public TO purposes_value_make;
ALTER TABLE case_edit_localized RENAME COLUMN purpose_value_private TO purposes_value_make_influence;
ALTER TABLE case_edit_localized RENAME COLUMN purpose_value_goods TO purposes_value_deliver;
ALTER TABLE case_edit_localized RENAME COLUMN purpose_value_civic TO purposes_value_develop;
ALTER TABLE case_edit_localized RENAME COLUMN purpose_value_research TO purposes_value_academic;

-- approaches

ALTER TABLE case_edit_localized RENAME COLUMN approach_value_advocacy TO approaches_value_advocacy;
ALTER TABLE case_edit_localized RENAME COLUMN approach_value_citizenship TO approaches_value_citizenship;
ALTER TABLE case_edit_localized RENAME COLUMN approach_value_civil TO approaches_value_civil;
ALTER TABLE case_edit_localized RENAME COLUMN approach_value_cogovernance TO approaches_value_cogovernance;
ALTER TABLE case_edit_localized RENAME COLUMN approach_value_consultation TO approaches_value_consultation;
ALTER TABLE case_edit_localized RENAME COLUMN approach_value_independent TO approaches_value_independent;
ALTER TABLE case_edit_localized RENAME COLUMN approach_value_leadership TO approaches_value_leadership;
ALTER TABLE case_edit_localized RENAME COLUMN approach_value_protest TO approaches_value_protest;
ALTER TABLE case_edit_localized RENAME COLUMN approach_value_research TO approaches_value_research;
ALTER TABLE case_edit_localized RENAME COLUMN approach_value_public_partner TO approaches_value_coproduction ;
ALTER TABLE case_edit_localized RENAME COLUMN approach_value_private_partner TO approaches_value_coproduction_form ;
ALTER TABLE case_edit_localized RENAME COLUMN approach_value_decision TO approaches_value_direct ;
ALTER TABLE case_edit_localized RENAME COLUMN approach_value_nongovernmental TO approaches_value_informal ;
ALTER TABLE case_edit_localized RENAME COLUMN approach_value_political TO approaches_value_informal_engagement ;
ALTER TABLE case_edit_localized RENAME COLUMN approach_value_auditing TO approaches_value_evaluation ;
ALTER TABLE case_edit_localized RENAME COLUMN approach_value_mobilization TO approaches_value_social ;

-- public spectrum

ALTER TABLE case_edit_localized RENAME COLUMN public_spectrum_value_na TO public_spectrum_value_not;

-- open limited

ALTER TABLE case_edit_localized RENAME COLUMN open_limited_value_all TO open_limited_value_open;
ALTER TABLE case_edit_localized RENAME COLUMN open_limited_value_special TO open_limited_value_open_to;

-- recruitment method

ALTER TABLE case_edit_localized RENAME COLUMN recruitment_method_value_na TO recruitment_method_value_not;

-- Targeted participants

ALTER TABLE case_edit_localized RENAME COLUMN targeted_participants_value_disabilities TO targeted_participants_value_people;
ALTER TABLE case_edit_localized RENAME COLUMN targeted_participants_value_ethnic TO targeted_participants_value_racialethnic;
ALTER TABLE case_edit_localized RENAME COLUMN targeted_participants_value_low_income TO targeted_participants_value_lowincome;
ALTER TABLE case_edit_localized RENAME COLUMN targeted_participants_value_stakeholders TO targeted_participants_value_stakeholder;

-- method types

ALTER TABLE case_edit_localized RENAME COLUMN method_types_value_ TO method_types_value_collaborative;
ALTER TABLE case_edit_localized RENAME COLUMN method_types_value_arts TO method_types_value_participatory;
ALTER TABLE case_edit_localized RENAME COLUMN method_types_value_auditing TO method_types_value_evaluation;
ALTER TABLE case_edit_localized RENAME COLUMN method_types_value_budgeting TO method_types_value_public;
ALTER TABLE case_edit_localized RENAME COLUMN method_types_value_community TO method_types_value_longterm;
ALTER TABLE case_edit_localized RENAME COLUMN method_types_value_conversation TO method_types_value_informal;
ALTER TABLE case_edit_localized RENAME COLUMN method_types_value_democracy TO method_types_value_direct;
ALTER TABLE case_edit_localized RENAME COLUMN method_types_value_education TO method_types_value_experiential;
ALTER TABLE case_edit_localized RENAME COLUMN method_types_value_management TO method_types_value_internal;
ALTER TABLE case_edit_localized RENAME COLUMN method_types_value_participant_meetings TO method_types_value_participantled;
ALTER TABLE case_edit_localized RENAME COLUMN method_types_value_participation TO method_types_value_informal_participation;

-- tools, techniques, types

ALTER TABLE case_edit_localized RENAME COLUMN tool_types_value_feedback TO tool_types_collect;
ALTER TABLE case_edit_localized RENAME COLUMN tool_types_value_dialogue TO tool_types_facilitate;
ALTER TABLE case_edit_localized RENAME COLUMN tool_types_value_decisions TO tool_types_facilitate_decisionmaking;
ALTER TABLE case_edit_localized RENAME COLUMN tool_types_value_educate TO tool_types_inform;
ALTER TABLE case_edit_localized RENAME COLUMN tool_types_value_money TO tool_types_manage;
ALTER TABLE case_edit_localized RENAME COLUMN tool_types_value_map TO tool_types_plan;
ALTER TABLE case_edit_localized RENAME COLUMN tool_types_value_policies TO tool_types_propose;

-- legality

ALTER TABLE case_edit_localized RENAME COLUMN legality_value_idk TO legality_value_dont;

-- facetoface or online

ALTER TABLE case_edit_localized RENAME COLUMN facetoface_value_both TO facetoface_online_or_both_value_both;
ALTER TABLE case_edit_localized RENAME COLUMN facetoface_value_facetoface TO facetoface_online_or_both_value_facetoface;
ALTER TABLE case_edit_localized RENAME COLUMN facetoface_value_online TO facetoface_online_or_both_value_online;

-- participants_interactions

ALTER TABLE case_edit_localized RENAME COLUMN participants_interaction_value_bargaining TO participants_interactions_value_negotiation;
ALTER TABLE case_edit_localized RENAME COLUMN participants_interaction_value_dialogue TO participants_interactions_value_discussion;
ALTER TABLE case_edit_localized RENAME COLUMN participants_interaction_value_drama TO participants_interactions_value_acting;
ALTER TABLE case_edit_localized RENAME COLUMN participants_interaction_value_none TO participants_interactions_value_no_interaction;
ALTER TABLE case_edit_localized RENAME COLUMN participants_interaction_value_opinions TO participants_interactions_value_express;
ALTER TABLE case_edit_localized RENAME COLUMN participants_interaction_value_questions TO participants_interactions_value_ask;
ALTER TABLE case_edit_localized RENAME COLUMN participants_interaction_value_social TO participants_interactions_value_informal;
ALTER TABLE case_edit_localized RENAME COLUMN participants_interaction_value_spectator TO participants_interactions_value_listenwatch;
ALTER TABLE case_edit_localized RENAME COLUMN participants_interaction_value_teaching TO participants_interactions_value_teachinginstructing;
ALTER TABLE case_edit_localized RENAME COLUMN participants_interaction_value_testimony TO participants_interactions_value_formal;
ALTER TABLE case_edit_localized RENAME COLUMN participants_interaction_value_storytelling TO participants_interactions_value_storytelling;

-- learning resources

ALTER TABLE case_edit_localized RENAME COLUMN learning_resources_value_na TO learning_resources_value_not;
ALTER TABLE case_edit_localized RENAME COLUMN learning_resources_value_none TO learning_resources_value_no_info;
ALTER TABLE case_edit_localized RENAME COLUMN learning_resources_value_teach TO learning_resources_value_teachins;
ALTER TABLE case_edit_localized RENAME COLUMN learning_resources_value_visits TO learning_resources_value_site;

-- decision methods

ALTER TABLE case_edit_localized RENAME COLUMN decision_methods_value_idk TO decision_methods_value_dont;
ALTER TABLE case_edit_localized RENAME COLUMN decision_methods_value_agreement TO decision_methods_value_general;
ALTER TABLE case_edit_localized RENAME COLUMN decision_methods_value_ideas TO decision_methods_value_idea;

-- if_voting

ALTER TABLE case_edit_localized RENAME COLUMN if_voting_value_super TO if_voting_value_supermajoritarian;
ALTER TABLE case_edit_localized RENAME COLUMN if_voting_value_dk TO if_voting_value_dont;

-- insights_outcomes

ALTER TABLE case_edit_localized RENAME COLUMN insights_outcomes_value_hearings TO insights_outcomes_value_public_hearingsmeetings;
ALTER TABLE case_edit_localized RENAME COLUMN insights_outcomes_value_media TO insights_outcomes_value_traditional;
ALTER TABLE case_edit_localized RENAME COLUMN insights_outcomes_value_protests TO insights_outcomes_value_protestspublic;
ALTER TABLE case_edit_localized RENAME COLUMN insights_outcomes_value_report TO insights_outcomes_value_public;
ALTER TABLE case_edit_localized RENAME COLUMN insights_outcomes_value_social TO insights_outcomes_value_new;
ALTER TABLE case_edit_localized RENAME COLUMN insights_outcomes_value_wordofmouth TO insights_outcomes_value_word;

-- organizer_types

ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_academic TO organizer_types_value_academic;
ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_activist TO organizer_types_value_activist;
ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_business TO organizer_types_value_forprofit;
ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_community TO organizer_types_value_community;
ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_faith TO organizer_types_value_faithased;
ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_government_corp TO organizer_types_value_governmentowned;
ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_individual TO organizer_types_value_individual;
ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_international TO organizer_types_value_international;
ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_labour TO organizer_types_value_labortrade;
ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_local_government TO organizer_types_value_local;
ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_na TO organizer_types_value_na;
ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_national_government TO organizer_types_value_national;
ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_ngo TO organizer_types_value_nongovernmental;
ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_philanthropic TO organizer_types_value_philanthropic;
ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_regional_government TO organizer_types_value_regional;
ALTER TABLE case_edit_localized RENAME COLUMN organizer_type_value_social TO organizer_types_value_social;

-- funder_types

ALTER TABLE case_edit_localized RENAME COLUMN funder_types_value_business TO funder_types_value_forprofit;
ALTER TABLE case_edit_localized RENAME COLUMN funder_types_value_faith TO funder_types_value_faithbased;
ALTER TABLE case_edit_localized RENAME COLUMN funder_types_value_government_corp TO funder_types_value_governmentowned;
ALTER TABLE case_edit_localized RENAME COLUMN funder_types_value_labour TO funder_types_value_labortrade;
ALTER TABLE case_edit_localized RENAME COLUMN funder_types_value_local_government TO funder_types_value_local;
ALTER TABLE case_edit_localized RENAME COLUMN funder_types_value_ngo TO funder_types_value_nongovernmental;
ALTER TABLE case_edit_localized RENAME COLUMN funder_types_value_national_government TO funder_types_value_national;
ALTER TABLE case_edit_localized RENAME COLUMN funder_types_value_regional_government TO funder_types_value_regional;

-- change_types

ALTER TABLE case_edit_localized RENAME COLUMN change_types_value_behaviour TO change_types_value_changes;
ALTER TABLE case_edit_localized RENAME COLUMN change_types_value_capacities TO change_types_value_changes_civic;
ALTER TABLE case_edit_localized RENAME COLUMN change_types_value_operations TO change_types_value_changes_how;
ALTER TABLE case_edit_localized RENAME COLUMN change_types_value_policy TO change_types_value_changes_public;
ALTER TABLE case_edit_localized RENAME COLUMN change_types_value_transformation TO change_types_value_conflict;

-- implementers_of_change

ALTER TABLE case_edit_localized RENAME COLUMN implementers_of_change_value_idk TO implementers_of_change_value_dont;
ALTER TABLE case_edit_localized RENAME COLUMN implementers_of_change_value_public TO implementers_of_change_value_lay;
ALTER TABLE case_edit_localized RENAME COLUMN implementers_of_change_value_stakeholders TO implementers_of_change_value_stakeholder;
