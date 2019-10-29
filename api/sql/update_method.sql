UPDATE methods
SET
-- admin-only
  original_language = ${original_language},
  post_date = ${post_date},
  featured = ${featured},
  hidden = ${hidden},
  completeness = ${completeness},
-- automatic
  updated_date = ${updated_date},
-- media lists
  files = ${files},
  links = ${links},
  videos = ${videos},
  audio = ${audio},
  photos = ${photos},
-- keys
  facilitators = ${facilitators},
  facetoface_online_or_both = ${facetoface_online_or_both},
  public_spectrum = ${public_spectrum},
  open_limited = ${open_limited},
  recruitment_method = ${recruitment_method},
  level_polarization = ${level_polarization},
  level_complexity = ${level_complexity},
-- list of keys
  method_types = ${method_types},
  number_of_participants = ${number_of_participants},
  scope_of_influence = ${scope_of_influence},
  participants_interactions = ${participants_interactions},
  decision_methods = ${decision_methods},
  if_voting = ${if_voting},
  purpose_method = ${purpose_method}
WHERE
  id = ${id}
;
