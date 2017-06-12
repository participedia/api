-- Parameters
-- query
-- language (defaults to 'en')
-- userid (may be null)
-- filter (only return results of *type*

SELECT id, type, title, to_json(location) AS location, to_json(lead_image) AS lead_image
FROM things, localized_texts
WHERE things.featured = true AND
      things.id = localized_texts.thingid AND
      localized_texts.language = ${language}
      ${filter:raw}
ORDER BY things.id DESC
;
