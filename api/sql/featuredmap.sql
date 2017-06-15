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
  to_json(COALESCE(lead_image, '("","",0)'::attachment)) AS lead_image
FROM things, localized_texts
WHERE things.id = localized_texts.thingid AND
      things.hidden = false AND
      localized_texts.language = ${language}
      ${filter:raw}
ORDER BY things.featured, updated_date DESC
;
