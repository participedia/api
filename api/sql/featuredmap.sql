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
  to_json(get_location(things.id)) AS location,
  to_json(COALESCE(images, '{}')) AS images,
  to_json(COALESCE(images, '{}')) AS photos,
  to_json(COALESCE(videos, '{}')) AS videos,
  updated_date
FROM
  things,
  get_localized_texts(things.id, ${language}) AS texts
WHERE things.hidden = false
ORDER BY things.featured DESC, updated_date DESC
;
