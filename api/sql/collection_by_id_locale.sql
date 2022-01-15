WITH full_thing AS (
SELECT distinct on (localized_texts."language") *,
  id,
  type,
  localized_texts.title,
  localized_texts.description,
  localized_texts.body,
  original_language,
  post_date,
  published,
  updated_date,
  location_name,
  address1,
  address2,
  city,
  province,
  postal_code,
  country,
  tags,
  featured,
  hidden,
  verified,
  reviewed_at,
  reviewed_by,
  files,
  links,
  photos,
  videos,
  audio,
  latitude,
  longitude
FROM
  collections
  INNER JOIN localized_texts on thingid = ${articleid}
WHERE
  collections.id = ${articleid}
) SELECT to_json(full_thing.*) results FROM full_thing


