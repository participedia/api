UPDATE methods
SET
-- admin-only
  original_language = ${original_language},
  post_date = ${post_date},
  featured = ${featured},
  hidden = ${hidden},
-- automatic
  updated_date = 'now',
-- media lists
  -- full_files = ${files},
  -- full_links = ${links},
  -- full_videos = ${videos},
  -- audio = ${audio},
  -- photos = ${photos},
  images = ${images},
  -- evaluation_reports = ${evaluation_reports},
  -- evaluation_links = ${evaluation_links},
-- boolean
  facilitated = ${facilitated},
-- yes/no
  impact_evidence = ${impact_evidence},
  formal_evaluation = ${formal_evaluation},
-- number
  number_of_participants = ${number_of_participants},
-- plain text
-- key
  completeness = ${completeness},
  geographical_scope = ${geographical_scope},
  recruitment_method = ${recruitment_method},
  decision_method = ${decision_method},
  if_voting = ${if_voting},
  issue_polarization = ${issue_polarization},
  issue_technical_complexity = ${issue_technical_complexity},
  issue_interdependency = ${issue_interdependency},
-- list of keys
  participant_selections = ${participant_selections},
  communication_modes = ${communication_modes},
  public_interaction_methods = ${public_interaction_methods},
  typical_purposes = ${typical_purposes},
  communication_outcomes = ${communication_outcomes}
WHERE
  id = ${id}
;
