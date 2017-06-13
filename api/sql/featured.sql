-- Parameters
-- query
-- language (defaults to 'en')
-- offset (defaults to 1)
-- limit (20 for now)
-- userid (may be null)
-- filter (only return results of *type*
SELECT
  id,
  type,
  featured,
  title,
  substring(body for 500) AS body,
  to_json(COALESCE(location, '("","","","","","","","","")'::geolocation)) AS location,
  to_json(COALESCE(lead_image, '("","",0)'::attachment)) AS lead_image,
  updated_date,
  bookmarked(type, id, ${userId})
FROM things, localized_texts
WHERE things.id = localized_texts.thingid AND
      localized_texts.language = ${language}
      ${filter:raw}
ORDER BY featured DESC, updated_date DESC
OFFSET ${offset}
LIMIT ${limit}
;
