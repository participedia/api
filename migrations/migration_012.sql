-- Change "United States" to "United States of America"

UPDATE cases SET content_country = 'United States of America' WHERE content_country = 'United States';
UPDATE cases SET location.country = 'United States of America' WHERE (location).country = 'United States';
UPDATE methods SET location.country = 'United States of America' WHERE (location).country = 'United States';
UPDATE organizations SET location.country = 'United States of America' WHERE (location).country = 'United States';

-- All empty Text values that are not mandatory should default to "" vs. null

ALTER TABLE cases
  ALTER COLUMN original_language SET DEFAULT '',
  ALTER COLUMN issue SET DEFAULT '',
  ALTER COLUMN communication_mode SET DEFAULT '',
  ALTER COLUMN communication_with_audience SET DEFAULT '',
  ALTER COLUMN content_country SET DEFAULT '',
  ALTER COLUMN decision_method SET DEFAULT '',
  ALTER COLUMN facilitated SET DEFAULT '',
  ALTER COLUMN targeted_participant_demographic SET DEFAULT '',
  ALTER COLUMN kind_of_influence SET DEFAULT '',
  ALTER COLUMN targeted_participants_public_role SET DEFAULT '',
  ALTER COLUMN targeted_audience SET DEFAULT '',
  ALTER COLUMN participant_selection SET DEFAULT '',
  ALTER COLUMN specific_topic SET DEFAULT '',
  ALTER COLUMN staff_type SET DEFAULT '',
  ALTER COLUMN type_of_funding_entity SET DEFAULT '',
  ALTER COLUMN typical_implementing_entity SET DEFAULT '',
  ALTER COLUMN typical_sponsoring_entity SET DEFAULT '',
  ALTER COLUMN who_else_supported_the_initiative SET DEFAULT '',
  ALTER COLUMN location SET DEFAULT '("","","","","","","","","") ',
  ALTER COLUMN other_images SET DEFAULT '{}',
  ALTER COLUMN files SET DEFAULT '{}',
  ALTER COLUMN videos SET DEFAULT '{}',
  ALTER COLUMN tags SET DEFAULT '{}'
  ;

ALTER TABLE methods
  ALTER COLUMN original_language SET DEFAULT '',
  ALTER COLUMN best_for SET DEFAULT '',
  ALTER COLUMN communication_mode SET DEFAULT '',
  ALTER COLUMN decision_method SET DEFAULT '',
  ALTER COLUMN governance_contribution SET DEFAULT '',
  ALTER COLUMN issue_interdependency SET DEFAULT '',
  ALTER COLUMN issue_polarization SET DEFAULT '',
  ALTER COLUMN issue_technical_complexity SET DEFAULT '',
  ALTER COLUMN kind_of_influence SET DEFAULT '',
  ALTER COLUMN method_of_interaction SET DEFAULT '',
  ALTER COLUMN public_interaction_method SET DEFAULT '',
  ALTER COLUMN typical_funding_source SET DEFAULT '',
  ALTER COLUMN typical_implementing_entity SET DEFAULT '',
  ALTER COLUMN typical_sponsoring_entity SET DEFAULT '',
  ALTER COLUMN other_images SET DEFAULT '{}',
  ALTER COLUMN files SET DEFAULT '{}',
  ALTER COLUMN videos SET DEFAULT '{}',
  ALTER COLUMN tags SET DEFAULT '{}',
  ALTER COLUMN location SET DEFAULT '("","","","","","","","","")'
;

ALTER TABLE organizations
  ALTER COLUMN original_language SET DEFAULT '',
  ALTER COLUMN executive_director SET DEFAULT '',
  ALTER COLUMN issue SET DEFAULT '',
  ALTER COLUMN sector SET DEFAULT '',
  ALTER COLUMN location SET DEFAULT '("","","","","","","","","")',
  ALTER COLUMN other_images SET DEFAULT '{}',
  ALTER COLUMN files SET DEFAULT '{}',
  ALTER COLUMN videos SET DEFAULT '{}',
  ALTER COLUMN tags SET DEFAULT '{}'
;
