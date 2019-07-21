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
  files = ${files}::full_file[],
  links = ${links},
  videos = ${videos},
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
  specific_methods_tools_techniques = ${specific_methods_tools_techniques},
-- key
  scope_of_influence = ${scope_of_influence},
  public_spectrum = ${public_spectrum},
  legality = ${legality},
  facilitator_training = ${facilitator_training},
  facetoface_online_or_both = ${facetoface_online_or_both},
-- list of keys
  general_issues = ${general_issues},
  specific_topics = ${specific_topics},
  time_limited = ${time_limited},
  purposes = ${purposes},
  approaches = ${approaches},
  open_limited = ${open_limited},
  recruitment_method = ${recruitment_method},
  targeted_participants = ${targeted_participants},
  method_types = ${method_types},
  participants_interactions = ${participants_interactions},
  learning_resources = ${learning_resources},
  decision_methods = ${decision_methods},
  if_voting = ${if_voting},
  insights_outcomes = ${insights_outcomes},
  organizer_types = ${organizer_types},
  funder_types = ${funder_types},
  change_types = ${change_types},
  implementers_of_change = ${implementers_of_change},
  tools_techniques_types = ${tools_techniques_types},
  facilitators = ${facilitators}
--  not in use, still in db
  -- process_methods = ${process_methods},
WHERE
  id = ${id}
;
