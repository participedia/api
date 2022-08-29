UPDATE collections
SET
-- admin-only
  original_language = ${original_language},
  post_date = ${post_date},
  featured = ${featured},
  hidden = ${hidden},
  published = ${published},
  verified = ${verified},
  reviewed_at = ${reviewed_at},
  reviewed_by = ${reviewed_by},
-- automatic
  updated_date = ${updated_date},
-- media lists
  files = ${files},
  links = ${links},
  videos = ${videos},
  audio = ${audio},
  photos = ${photos}
WHERE
  id = ${id}
;
