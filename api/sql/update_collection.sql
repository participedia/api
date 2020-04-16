UPDATE collections
SET
-- admin-only
  original_language = ${original_language},
  post_date = ${post_date},
  featured = ${featured},
  hidden = ${hidden},
-- automatic
  updated_date = ${updated_date},
-- media lists
  files = ${files},
  links = ${links},
  videos = ${videos},
  audio = ${audio},
  photos = ${photos},
WHERE
  id = ${id}
;
