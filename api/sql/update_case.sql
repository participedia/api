UPDATE cases
SET
-- admin-only
  original_language = ${original_language},
  post_date = ${post_date},
  featured = ${featured},
  hidden = ${hidden},
-- automatic
  updated_date = 'now',
-- media lists
  full_files = ${files},
  full_links = ${links},
  full_videos = ${videos},
  audio = ${audio},
  photos = ${photos},
  evaluation_reports = ${evaluation_reports},
  evaluation_links = ${evaluation_links},
-- boolean
  ongoing = ${ongoing},
  staff = ${staff},
  volunteers = ${volunteers},
-- yes/no
  impact_evidence = ${impact_evidence},
  formal_evaluation = ${formal_evaluation},
-- number
  number_of_participants = ${number_of_participants},
-- plain text
  location_name = ${location_name},
  address1 = ${address1},
  address2 = ${address2},
  city = ${city},
  province = ${province},
  postal_code = ${postal_code},
  country = ${country},
  latitude = ${latitude},
  longitude = ${longitude},
  funder = ${funder},
-- dates
  start_date = ${start_date},
  end_date = ${end_date},
-- id
  is_component_of = ${is_component_of},
  primary_organizer = ${primary_organizer},
-- list of ids
  specific_methods_tools_techniques = ${specific_methods_tools_techniques:raw},
-- key
  scope_of_influence = ${scope_of_influence},
  public_spectrum = ${public_spectrum},
  legality = ${legality},
  facilitator_training = ${facilitator_training},
  facetoface_online_or_both = ${facetoface_online_or_both},
-- list of keys
  general_issues = ${general_issues:raw},
  specific_topics = ${specific_topics:raw},
  time_limited = ${time_limited:raw},
  purposes = ${purposes:raw},
  approaches = ${approaches:raw},
  open_limited = ${open_limited:raw},
  recruitment_method = ${recruitment_method:raw},
  targeted_participants = ${targeted_participants:raw},
  method_types = ${method_types:raw},
  participants_interactions = ${participants_interactions:raw},
  learning_resources = ${learning_resources:raw},
  decision_methods = ${decision_methods:raw},
  if_voting = ${if_voting:raw},
  insights_outcomes = ${insights_outcomes:raw},
  organizer_types = ${organizer_types:raw},
  funder_types = ${funder_types:raw},
  change_types = ${change_types:raw},
  implementers_of_change = ${implementers_of_change:raw},
  tools_techniques_types = ${tools_techniques_types:raw},
-- list of tag keys
  tags = ${tags:raw}
--  not in use, still in db
  -- facilitators = ${facilitators},
  -- process_methods = ${process_methods:raw},
WHERE
  id = ${id}
;
