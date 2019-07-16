-- Parameters
-- query
-- language (defaults to 'en')
-- userid (may be null)
-- filter (only return results of *type*

SELECT
  id,
  type,
  featured,
  featured as searchmatched,
  texts.title,
  texts.description,
  substring(texts.body for 500) AS body,
  location_name,
  address1,
  address2,
  city,
  province,
  postal_code,
  country,
  latitude,
  longitude,
  to_json(COALESCE(photos, '{}')) AS photos,
  to_json(COALESCE(videos, '{}')) AS videos,
  updated_date,
  post_date
FROM
  ${type:name},
  get_localized_texts_fallback(${type:name}.id, ${language}, ${type:name}.original_language) AS texts
WHERE
  ${type:name}.hidden = false
  ${facets:raw}
ORDER BY ${type:name}.featured DESC, updated_date DESC
;
