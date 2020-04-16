SELECT row_to_json(results.*) as results from (
SELECT
  id,
  type,
  texts.title,
  texts.description,
  texts.body,
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
  files,
  links,
  photos,
  videos,
  audio,
  latitude,
  longitude
FROM
  collections,
  get_localized_texts_fallback(${articleid}, ${lang}, collections.original_language) AS texts
WHERE
  collections.id = ${articleid}
) AS results;


