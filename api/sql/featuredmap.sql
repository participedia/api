-- Parameters
-- query
-- language (defaults to 'en')
-- userid (may be null)
-- filter (only return results of *type*

SELECT
  id,
  type,
  featured,
  title,
  to_json(COALESCE(location, '("","","","","","","","","")'::geolocation)) AS location,
  to_json(COALESCE(images, '{}')) AS images,
  to_json(COALESCE(videos, '{}')) AS videos
FROM things, localized_texts
WHERE things.id = localized_texts.thingid AND
      things.hidden = false AND
      localized_texts.language = ${language}
      ${filter:raw}
ORDER BY things.featured DESC, updated_date DESC
;
