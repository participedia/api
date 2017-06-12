-- Parameters
-- query
-- language (defaults to 'en'
-- offset (defaults to 1)
-- limit (20 for now)
-- userid (may be null)
SELECT id, type, title, substring(body for 500) AS body, to_json(location) AS location, to_json(lead_image) AS lead_image, updated_date, bookmarked(type, id, ${userId})
FROM search_index_${language:raw}
WHERE document @@ plainto_tsquery('english', ${query}) ${filter:raw}
ORDER BY ts_rank(search_index_${language:raw}.document, plainto_tsquery('english', ${query})) DESC
OFFSET ${offset}
LIMIT ${limit}
;
