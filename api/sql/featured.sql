-- Parameters
-- query
-- language (defaults to 'en')
-- offset (defaults to 1)
-- limit (20 for now)
-- userid (may be null)
-- filter (only return results of *type*
SELECT id, type, title, substring(body for 500) AS body, to_json(location) AS location, to_json(lead_image) AS lead_image, updated_date, bookmarked(type, id, ${userId})
FROM things, localized_texts
WHERE things.featured = true AND
      things.id = localized_texts.thingid AND
      localized_texts.language = ${language}
      ${filter:raw}
ORDER BY things.id DESC
OFFSET ${offset}
LIMIT ${limit}
;
