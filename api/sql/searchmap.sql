-- Parameters
-- query
-- language (defaults to 'en'
-- offset (defaults to 1)
-- limit (20 for now)
-- userid (may be null)
WITH searchresults AS (
  SELECT id
  FROM search_index_${language:raw}
  WHERE
    document @@ to_tsquery('english', ${query})
)

SELECT
  id,
  type,
  CASE 
		WHEN type='case' THEN get_completeness_case(id)
		WHEN type='method' THEN get_completeness_methods(id)
		WHEN type='organization' THEN get_completeness_organizations(id)
		ELSE ''
     END as completeness,
  featured,
  location_name,
  address1,
  address2,
  city,
  province,
  postal_code,
  country,
  latitude,
  longitude,
  EXISTS (SELECT 1 FROM searchresults WHERE ${type:name}.id = searchresults.id) searchmatched,
  texts.title,
  texts.description,
  substring(texts.body for 500) AS body,
  to_json(COALESCE(photos, '{}')) AS photos,
  to_json(COALESCE(videos, '{}')) AS videos,
  updated_date,
  post_date,
  friendly_id
FROM
  ${type:name},
  get_localized_texts_fallback(${type:name}.id, ${language}, ${type:name}.original_language) AS texts
Where
  ${type:name}.hidden = false
      ${facets:raw}

ORDER BY searchmatched DESC, featured DESC, updated_date DESC
;
