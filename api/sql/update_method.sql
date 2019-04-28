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
  files = ${files},
  links = ${links},
  videos = ${videos},
  audio = ${audio},
  photos = ${photos},
-- boolean
  facilitator = ${facilitator},
-- keys
  facetoface_online_or_both = ${facetoface_online_or_both},
  public_spectrum = ${public_spectrum},
  open_limited = ${open_limited},
  recruitment_method = ${recruitment_method},
  level_polarization = ${level_polarization},
  scope_of_influence = ${scope_of_influence},
-- list of keys
  method_types = ${method_types},
  number_of_participants = ${number_of_participants},
  scope_of_influence = ${scope_of_influence},
  participants_interactions = ${participants_interactions},
  decision_methods = ${decision_methods},
  if_voting = ${if_voting}
WHERE
  id = ${id}
;
