-- Move orgamizations to new model

-- removed fields
-- can't delete tags or location fields becaue they are part of parent model
ALTER TABLE organizations DROP COLUMN executive_director;

-- new fields, types, defaults
ALTER TABLE organizations ADD COLUMN scope_of_influence TEXT[] default '{}';
ALTER TABLE organizations ADD COLUMN type_method TEXT[] default '{}';
ALTER TABLE organizations ADD COLUMN type_tool TEXT[] default '{}';
ALTER TABLE organizations ADD COLUMN specific_topics TEXT [] default '{}';
ALTER TABLE organizations ADD COLUMN specific_methods_tools_techniques INTEGER[] default '{}';

-- rename fields


-- map issues text -> general_issues text[] and clean up data
ALTER TABLE organizations ADD COLUMN general_issues TEXT[] DEFAULT '{}';
UPDATE organizations SET general_issues = issues::text[] where issues <> '{}';
ALTER TABLE organizations DROP COLUMN issues;
-- remove keys
update organizations set general_issues = array_remove(general_issues, 'Other');
update organizations set general_issues = array_remove(general_issues, 'Community Development');
update organizations set general_issues = array_remove(general_issues, 'Children & Youth');
update organizations set general_issues = array_remove(general_issues, 'Gender & Racial Equality');
-- change keys from text to localization key
update organizations set general_issues = array_replace(general_issues, 'Aging', 'social');
update organizations set general_issues = array_replace(general_issues, 'Arts & Culture', 'arts');
update organizations set general_issues = array_replace(general_issues, 'Budgeting', 'economics');
update organizations set general_issues = array_replace(general_issues, 'Economic Development', 'economics');
update organizations set general_issues = array_replace(general_issues, 'Education & Schools', 'educations');
update organizations set general_issues = array_replace(general_issues, 'Environment', 'environment');
update organizations set general_issues = array_replace(general_issues, 'Health', 'health');
update organizations set general_issues = array_replace(general_issues, 'Higher Education & Lifelong Learning', 'education');
update organizations set general_issues = array_replace(general_issues, 'Human Rights', 'human');
update organizations set general_issues = array_replace(general_issues, 'Identity & Diversity', 'identity');
update organizations set general_issues = array_replace(general_issues, 'Immigration', 'immigration');
update organizations set general_issues = array_replace(general_issues, 'International Aid & Development', 'international');
update organizations set general_issues = array_replace(general_issues, 'International Trade & Global Economy', 'economics');
update organizations set general_issues = array_replace(general_issues, 'Law Enforcement, Criminal Justice, & Corrections', 'law');
update organizations set general_issues = array_replace(general_issues, 'National & International Security', 'national');
update organizations set general_issues = array_replace(general_issues, 'Planning (e.g. Urban planning, Transportation, etc.)', 'planning');
update organizations set general_issues = array_replace(general_issues, 'Political Institutions (e.g. Constitutions, Legal Systems, Electoral Systems)', 'governance');
update organizations set general_issues = array_replace(general_issues, 'Poverty Reduction', 'human');
update organizations set general_issues = array_replace(general_issues, 'Science & Technology', 'science');
