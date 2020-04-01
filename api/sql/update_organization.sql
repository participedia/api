 UPDATE organizations
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
-- text
  location_name = ${location_name},
  address1 = ${address1},
  address2 = ${address2},
  city = ${city},
  province = ${province},
  postal_code = ${postal_code},
  country = ${country},
-- floats
  latitude = ${latitude},
  longitude = ${longitude},
-- keys
  sector = ${sector},
-- list of keys
  scope_of_influence = ${scope_of_influence},
  type_method = ${type_method},
  type_tool = ${type_tool},
  specific_topics = ${specific_topics},
  general_issues = ${general_issues},
  collections = ${collections},
-- ids
  specific_methods_tools_techniques = ${specific_methods_tools_techniques}
WHERE
  id = ${id}
;
