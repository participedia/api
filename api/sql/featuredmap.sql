-- Parameters
-- query
-- language (defaults to 'en')
-- userid (may be null)
-- filter (only return results of *type*

SELECT
  id,
  type,
  featured,
  CASE WHEN featured = TRUE ${filter:raw} THEN TRUE
	    ELSE FALSE
	END searchmatched,
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
  things,
  get_localized_texts(things.id, ${language}) AS texts
WHERE things.hidden = false
ORDER BY things.featured DESC, updated_date DESC
;
