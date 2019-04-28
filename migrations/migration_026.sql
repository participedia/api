-- Create table for legal field
-- This is because fields share yes, no, not applicable, and don't know keys

CREATE TABLE legal_case_field_keys(
  field TEXT NOT NULL,
  key TEXT NOT NULL,
  ordering INTEGER NOT NULL
);

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
    rotate_case_view_localized('en') as view
  WHERE
    view.key LIKE 'tool_types_value_%';
select insert_localized_values('scope');
select insert_localized_values('time_limited');
select insert_localized_values('purposes');
select insert_localized_values('approaches');
select insert_localized_values('public_spectrum');
select insert_localized_values('open_limited');
select insert_localized_values('recruitment_method');
select insert_localized_values('targeted_participants');
select insert_localized_values('method_types');
select insert_localized_values('tool_types');
select insert_localized_values('legality');
select insert_localized_values('facilitators');
select insert_localized_values('facilitator_training');
select insert_localized_values('facetoface_online_or_both');
select insert_localized_values('participant_interaction');
select insert_localized_values('learning_resources');
select insert_localized_values('decision_methods');
select insert_localized_values('if_voting');
select insert_localized_values('insights_outcomes');
select insert_localized_values('organizer_types');
select insert_localized_values('funder_types');
select insert_localized_values('change_types');
select insert_localized_values('implementors_of_change');

INSERT INTO localized_case_field_values VALUES
  ('en', 'specific_topics_abilitydisability', 'Ability/Disability Issues', 'Ability/Disability Issues'),
  ('en', 'specific_topics_abortion', 'Abortion', 'Abortion'),
  ('en', 'specific_topics_access', 'Access to Radio & Television Frequencies', 'Access to Radio & Television Frequencies'),
  ('en', 'specific_topics_addiction', 'Addiction Treatment & Management', 'Addiction Treatment & Management'),
  ('en', 'specific_topics_administration', 'Administration of Campaigns and Elections', 'Administration of Campaigns and Elections'),
  ('en', 'specific_topics_affordable', 'Affordable Housing', 'Affordable Housing'),
  ('en', 'specific_topics_age', 'Age Discrimination', 'Age Discrimination'),
  ('en', 'specific_topics_aging', 'Aging', 'Aging'),
  ('en', 'specific_topics_aging_issues', 'Aging Issues', 'Aging Issues'),
  ('en', 'specific_topics_agricultural', 'Agricultural Biotechnology', 'Agricultural Biotechnology'),
  ('en', 'specific_topics_air', 'Air Quality', 'Air Quality'),
  ('en', 'specific_topics_air_travel', 'Air Travel', 'Air Travel'),
  ('en', 'specific_topics_alternative', 'Alternative & Renewable Energy', 'Alternative & Renewable Energy'),
  ('en', 'specific_topics_alternative_education', 'Alternative Education', 'Alternative Education'),
  ('en', 'specific_topics_animal', 'Animal Welfare', 'Animal Welfare'),
  ('en', 'specific_topics_arms', 'Arms Control', 'Arms Control'),
  ('en', 'specific_topics_artificial', 'Artificial Intelligence', 'Artificial Intelligence'),
  ('en', 'specific_topics_bankruptcy', 'Bankruptcy', 'Bankruptcy'),
  ('en', 'specific_topics_biomedical', 'Biomedical Research & Development', 'Biomedical Research & Development'),
  ('en', 'specific_topics_birth', 'Birth Control', 'Birth Control'),
  ('en', 'specific_topics_budget', 'Budget - Local', 'Budget - Local'),
  ('en', 'specific_topics_budget_national', 'Budget - National', 'Budget - National'),
  ('en', 'specific_topics_budget_provincial', 'Budget - Provincial, Regional, State', 'Budget - Provincial, Regional, State'),
  ('en', 'specific_topics_bureaucracy', 'Bureaucracy', 'Bureaucracy'),
  ('en', 'specific_topics_carbon', 'Carbon Capture & Sequestration', 'Carbon Capture & Sequestration'),
  ('en', 'specific_topics_censorship', 'Censorship', 'Censorship'),
  ('en', 'specific_topics_child', 'Child Care', 'Child Care'),
  ('en', 'specific_topics_citizenship', 'Citizenship & Role of Citizens', 'Citizenship & Role of Citizens'),
  ('en', 'specific_topics_civil', 'Civil Law', 'Civil Law'),
  ('en', 'specific_topics_climate', 'Climate Change', 'Climate Change'),
  ('en', 'specific_topics_coal', 'Coal', 'Coal'),
  ('en', 'specific_topics_cohousing', 'Cohousing', 'Cohousing'),
  ('en', 'specific_topics_community', 'Community & Police Relations', 'Community & Police Relations'),
  ('en', 'specific_topics_community_resettlement', 'Community Resettlement', 'Community Resettlement'),
  ('en', 'specific_topics_concentration', 'Concentration of Media Ownership', 'Concentration of Media Ownership'),
  ('en', 'specific_topics_constitutional', 'Constitutional Reform', 'Constitutional Reform'),
  ('en', 'specific_topics_consumer', 'Consumer Protection', 'Consumer Protection'),
  ('en', 'specific_topics_copyrights', 'Copyrights & Patents', 'Copyrights & Patents'),
  ('en', 'specific_topics_corporate', 'Corporate Subsidies', 'Corporate Subsidies'),
  ('en', 'specific_topics_court', 'Court Systems', 'Court Systems'),
  ('en', 'specific_topics_criminal', 'Criminal Law', 'Criminal Law'),
  ('en', 'specific_topics_cultural', 'Cultural Assimilation or Integration', 'Cultural Assimilation or Integration'),
  ('en', 'specific_topics_curriculum', 'Curriculum & Standards', 'Curriculum & Standards'),
  ('en', 'specific_topics_cyber', 'Cyber Security', 'Cyber Security'),
  ('en', 'specific_topics_cycling', 'Cycling', 'Cycling'),
  ('en', 'specific_topics_diplomacy', 'Diplomacy', 'Diplomacy'),
  ('en', 'specific_topics_disability', 'Disability Rights', 'Disability Rights'),
  ('en', 'specific_topics_disabled', 'Disabled Assistance', 'Disabled Assistance'),
  ('en', 'specific_topics_disaster', 'Disaster Preparedness', 'Disaster Preparedness'),
  ('en', 'specific_topics_disease', 'Disease Prevention', 'Disease Prevention'),
  ('en', 'specific_topics_drug', 'Drug Coverage & Cost', 'Drug Coverage & Cost'),
  ('en', 'specific_topics_drug_testing', 'Drug Testing & Regulation', 'Drug Testing & Regulation'),
  ('en', 'specific_topics_early', 'Early Childhood Education', 'Early Childhood Education'),
  ('en', 'specific_topics_ecohousing', 'Eco-Housing', 'Eco-Housing'),
  ('en', 'specific_topics_economic', 'Economic Development', 'Economic Development'),
  ('en', 'specific_topics_economic_inequality', 'Economic Inequality', 'Economic Inequality'),
  ('en', 'specific_topics_elderly', 'Elderly Assistance', 'Elderly Assistance'),
  ('en', 'specific_topics_elderly_housing', 'Elderly Housing', 'Elderly Housing'),
  ('en', 'specific_topics_electricity', 'Electricity', 'Electricity'),
  ('en', 'specific_topics_elementary', 'Elementary & Secondary Education', 'Elementary & Secondary Education'),
  ('en', 'specific_topics_employee', 'Employee Benefits', 'Employee Benefits'),
  ('en', 'specific_topics_energy', 'Energy Conservation', 'Energy Conservation'),
  ('en', 'specific_topics_energy_efficiency', 'Energy Efficiency & Storage', 'Energy Efficiency & Storage'),
  ('en', 'specific_topics_energy_siting', 'Energy Siting & Transmission', 'Energy Siting & Transmission'),
  ('en', 'specific_topics_environmental', 'Environmental Conservation', 'Environmental Conservation'),
  ('en', 'specific_topics_ethnicracial', 'Ethnic/Racial Equality & Equity', 'Ethnic/Racial Equality & Equity'),
  ('en', 'specific_topics_ethnicracial_relations', 'Ethnic/Racial Relations', 'Ethnic/Racial Relations'),
  ('en', 'specific_topics_fair', 'Fair Labor Standards', 'Fair Labor Standards'),
  ('en', 'specific_topics_financing', 'Financing of Political Campaigns', 'Financing of Political Campaigns'),
  ('en', 'specific_topics_fisheries', 'Fisheries & Fishing', 'Fisheries & Fishing'),
  ('en', 'specific_topics_food', 'Food & Nutrition', 'Food & Nutrition'),
  ('en', 'specific_topics_food_assistance', 'Food Assistance', 'Food Assistance'),
  ('en', 'specific_topics_food_inspection', 'Food Inspection & Safety', 'Food Inspection & Safety'),
  ('en', 'specific_topics_foreign', 'Foreign Aid', 'Foreign Aid'),
  ('en', 'specific_topics_freedom', 'Freedom of Information', 'Freedom of Information'),
  ('en', 'specific_topics_freedom_of', 'Freedom of Speech', 'Freedom of Speech'),
  ('en', 'specific_topics_funding', 'Funding', 'Funding'),
  ('en', 'specific_topics_gender', 'Gender Equality & Equity', 'Gender Equality & Equity'),
  ('en', 'specific_topics_gender_identity', 'Gender Identity', 'Gender Identity'),
  ('en', 'specific_topics_geopolitics', 'Geopolitics', 'Geopolitics'),
  ('en', 'specific_topics_geotechnology', 'Geotechnology', 'Geotechnology'),
  ('en', 'specific_topics_government', 'Government Corruption', 'Government Corruption'),
  ('en', 'specific_topics_government_funding', 'Government Funding of Education', 'Government Funding of Education'),
  ('en', 'specific_topics_government_spending', 'Government Spending', 'Government Spending'),
  ('en', 'specific_topics_government_subsidies', 'Government Subsidies', 'Government Subsidies'),
  ('en', 'specific_topics_government_transparency', 'Government Transparency', 'Government Transparency'),
  ('en', 'specific_topics_hazardous', 'Hazardous Waste', 'Hazardous Waste'),
  ('en', 'specific_topics_health', 'Health Care Reform', 'Health Care Reform'),
  ('en', 'specific_topics_health_insurance', 'Health Insurance', 'Health Insurance'),
  ('en', 'specific_topics_higher', 'Higher Education', 'Higher Education'),
  ('en', 'specific_topics_highway', 'Highway Safety', 'Highway Safety'),
  ('en', 'specific_topics_homelessness', 'Homelessness', 'Homelessness'),
  ('en', 'specific_topics_housing', 'Housing Planning', 'Housing Planning'),
  ('en', 'specific_topics_human', 'Human Rights', 'Human Rights'),
  ('en', 'specific_topics_human_trafficking', 'Human Trafficking', 'Human Trafficking'),
  ('en', 'specific_topics_identity', 'Identity Politics', 'Identity Politics'),
  ('en', 'specific_topics_immigration', 'Immigration', 'Immigration'),
  ('en', 'specific_topics_indigenous', 'Indigenous Issues', 'Indigenous Issues'),
  ('en', 'specific_topics_indigenous_planning', 'Indigenous Planning', 'Indigenous Planning'),
  ('en', 'specific_topics_industrial', 'Industrial Policy', 'Industrial Policy'),
  ('en', 'specific_topics_industrial_siting', 'Industrial Siting Guidelines', 'Industrial Siting Guidelines'),
  ('en', 'specific_topics_information', 'Information & Communications Technology', 'Information & Communications Technology'),
  ('en', 'specific_topics_infrastructure', 'Infrastructure', 'Infrastructure'),
  ('en', 'specific_topics_intellectual', 'Intellectual Property Rights', 'Intellectual Property Rights'),
  ('en', 'specific_topics_intelligence', 'Intelligence Gathering', 'Intelligence Gathering'),
  ('en', 'specific_topics_intergovernmental', 'Intergovernmental Relations', 'Intergovernmental Relations'),
  ('en', 'specific_topics_international', 'International Law', 'International Law'),
  ('en', 'specific_topics_internet', 'Internet Access', 'Internet Access'),
  ('en', 'specific_topics_internet_governance', 'Internet Governance', 'Internet Governance'),
  ('en', 'specific_topics_jails', 'Jails and Prisons', 'Jails and Prisons'),
  ('en', 'specific_topics_judicial', 'Judicial Reform', 'Judicial Reform'),
  ('en', 'specific_topics_labor', 'Labor Unions', 'Labor Unions'),
  ('en', 'specific_topics_land', 'Land Use', 'Land Use'),
  ('en', 'specific_topics_lgbtq', 'LGBTQ Issues', 'LGBTQ Issues'),
  ('en', 'specific_topics_libraries', 'Libraries', 'Libraries'),
  ('en', 'specific_topics_longterm', 'Long-Term Care', 'Long-Term Care'),
  ('en', 'specific_topics_lowincome', 'Low-income Assistance', 'Low-income Assistance'),
  ('en', 'specific_topics_maritime', 'Maritime', 'Maritime'),
  ('en', 'specific_topics_masspublic', 'Mass/Public Transport', 'Mass/Public Transport'),
  ('en', 'specific_topics_medical', 'Medical Liability', 'Medical Liability'),
  ('en', 'specific_topics_mental', 'Mental Health', 'Mental Health'),
  ('en', 'specific_topics_migrant', 'Migrant and Seasonal Labor', 'Migrant and Seasonal Labor'),
  ('en', 'specific_topics_military', 'Military and Defense', 'Military and Defense'),
  ('en', 'specific_topics_monetary', 'Monetary Policy', 'Monetary Policy'),
  ('en', 'specific_topics_museums', 'Museums', 'Museums'),
  ('en', 'specific_topics_nanotechnology', 'Nanotechnology', 'Nanotechnology'),
  ('en', 'specific_topics_natural', 'Natural Gas & Oil', 'Natural Gas & Oil'),
  ('en', 'specific_topics_natural_resource', 'Natural Resource Management', 'Natural Resource Management'),
  ('en', 'specific_topics_nuclear', 'Nuclear Energy', 'Nuclear Energy'),
  ('en', 'specific_topics_open', 'Open Data', 'Open Data'),
  ('en', 'specific_topics_pensions', 'Pensions & Retirement', 'Pensions & Retirement'),
  ('en', 'specific_topics_police', 'Police', 'Police'),
  ('en', 'specific_topics_political', 'Political Parties', 'Political Parties'),
  ('en', 'specific_topics_political_rights', 'Political Rights', 'Political Rights'),
  ('en', 'specific_topics_poverty', 'Poverty', 'Poverty'),
  ('en', 'specific_topics_public', 'Public Amenities', 'Public Amenities'),
  ('en', 'specific_topics_public_art', 'Public Art', 'Public Art'),
  ('en', 'specific_topics_public_participation', 'Public Participation', 'Public Participation'),
  ('en', 'specific_topics_public_safety', 'Public Safety', 'Public Safety'),
  ('en', 'specific_topics_quality', 'Quality of Health Care', 'Quality of Health Care'),
  ('en', 'specific_topics_railroads', 'Railroads', 'Railroads'),
  ('en', 'specific_topics_recycling', 'Recycling', 'Recycling'),
  ('en', 'specific_topics_refugee', 'Refugee Resettlement', 'Refugee Resettlement'),
  ('en', 'specific_topics_refugee_rights', 'Refugee Rights', 'Refugee Rights'),
  ('en', 'specific_topics_regional', 'Regional & Global Governance', 'Regional & Global Governance'),
  ('en', 'specific_topics_regionalism', 'Regionalism', 'Regionalism'),
  ('en', 'specific_topics_regulation', 'Regulation', 'Regulation'),
  ('en', 'specific_topics_regulatory', 'Regulatory Policy', 'Regulatory Policy'),
  ('en', 'specific_topics_religious', 'Religious Rights', 'Religious Rights'),
  ('en', 'specific_topics_research', 'Research & Development', 'Research & Development'),
  ('en', 'specific_topics_resilience', 'Resilience Planning & Design', 'Resilience Planning & Design'),
  ('en', 'specific_topics_right', 'Right to Adequate Housing', 'Right to Adequate Housing'),
  ('en', 'specific_topics_right_to', 'Right to Representation', 'Right to Representation'),
  ('en', 'specific_topics_roads', 'Roads and Highways', 'Roads and Highways'),
  ('en', 'specific_topics_rural', 'Rural Housing', 'Rural Housing'),
  ('en', 'specific_topics_school', 'School Governance', 'School Governance'),
  ('en', 'specific_topics_selfdriving', 'Self-Driving Vehicles', 'Self-Driving Vehicles'),
  ('en', 'specific_topics_sentencing', 'Sentencing Guidelines', 'Sentencing Guidelines'),
  ('en', 'specific_topics_social', 'Social Determinants of Health', 'Social Determinants of Health'),
  ('en', 'specific_topics_space', 'Space Exploration', 'Space Exploration'),
  ('en', 'specific_topics_special', 'Special Education', 'Special Education'),
  ('en', 'specific_topics_species', 'Species Protection', 'Species Protection'),
  ('en', 'specific_topics_sports', 'Sports', 'Sports'),
  ('en', 'specific_topics_substance', 'Substance Abuse', 'Substance Abuse'),
  ('en', 'specific_topics_sustainable', 'Sustainable Development', 'Sustainable Development'),
  ('en', 'specific_topics_taxation', 'Taxation', 'Taxation'),
  ('en', 'specific_topics_teacher', 'Teacher Training & Accountability', 'Teacher Training & Accountability'),
  ('en', 'specific_topics_telephone', 'Telephone Access', 'Telephone Access'),
  ('en', 'specific_topics_terrorism', 'Terrorism', 'Terrorism'),
  ('en', 'specific_topics_torture', 'Torture', 'Torture'),
  ('en', 'specific_topics_tourism', 'Tourism', 'Tourism'),
  ('en', 'specific_topics_trade', 'Trade and Tariffs', 'Trade and Tariffs'),
  ('en', 'specific_topics_transparency', 'Transparency', 'Transparency'),
  ('en', 'specific_topics_transportation', 'Transportation Planning', 'Transportation Planning'),
  ('en', 'specific_topics_treaties', 'Treaties', 'Treaties'),
  ('en', 'specific_topics_unemployment', 'Unemployment', 'Unemployment'),
  ('en', 'specific_topics_unofficial', 'Unofficial (Track II) Diplomacy', 'Unofficial (Track II) Diplomacy'),
  ('en', 'specific_topics_vocational', 'Vocational Education & Training', 'Vocational Education & Training'),
  ('en', 'specific_topics_wage', 'Wage Standards', 'Wage Standards'),
  ('en', 'specific_topics_walkingpedestrian', 'Walking/Pedestrian Mobility', 'Walking/Pedestrian Mobility'),
  ('en', 'specific_topics_waste', 'Waste Disposal', 'Waste Disposal'),
  ('en', 'specific_topics_water', 'Water Quality', 'Water Quality'),
  ('en', 'specific_topics_weather', 'Weather Forecasting', 'Weather Forecasting'),
  ('en', 'specific_topics_wilderness', 'Wilderness Protection', 'Wilderness Protection'),
  ('en', 'specific_topics_worker', 'Worker Health & Safety', 'Worker Health & Safety'),
  ('en', 'specific_topics_workforce', 'Workforce Education', 'Workforce Education'),
  ('en', 'specific_topics_youth', 'Youth Employment', 'Youth Employment'),
  ('en', 'specific_topics_youth_issues', 'Youth Issues', 'Youth Issues');

DROP SEQUENCE value_order;
DROP FUNCTION insert_fields(TEXT);
DROP FUNCTION insert_localized_values(TEXT);
