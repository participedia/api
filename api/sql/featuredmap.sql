-- Parameters
-- query
-- language (defaults to 'en')
-- userid (may be null)
-- filter (only return results of *type*

SELECT
  id,
  type,
  CASE 
		WHEN type='case' THEN get_completeness_case(id)
		WHEN type='method' THEN get_completeness_methods(id)
		WHEN type='organization' THEN get_completeness_organizations(id)
		ELSE ''
     END as completeness,
  CASE 
    WHEN type='case' THEN bookmarked('case', ${type:name}.id, ${userId})
    WHEN type='method' THEN bookmarked('method', ${type:name}.id, ${userId})
    WHEN type='organization' THEN bookmarked('organization', ${type:name}.id, ${userId})
    END as bookmarked,
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
  post_date,
  friendly_id
FROM
  ${type:name},
  get_localized_texts_fallback(${type:name}.id, ${language}, ${type:name}.original_language) AS texts
WHERE
  ${type:name}.hidden = false
  ${facets:raw}
ORDER BY ${type:name}.featured DESC, updated_date DESC
;
