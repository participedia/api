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
    WHEN type='case' THEN bookmarked('case', t.id, ${userId})
    WHEN type='method' THEN bookmarked('method', t.id, ${userId})
    WHEN type='organization' THEN bookmarked('organization', t.id, ${userId})
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
  post_date
FROM
  things t,
  get_localized_texts_fallback(t.id, ${language}, t.original_language) AS texts
WHERE
  t.type <> 'collection' AND t.hidden = false AND
  EXISTS (SELECT 1 FROM cases e WHERE e.id = t.id ${facets:raw})
  OR EXISTS (SELECT 1 FROM methods m  WHERE m.id = t.id ${facets:raw})
  OR EXISTS (SELECT 1 FROM organizations o  WHERE o.id = t.id ${facets:raw})
ORDER BY t.featured DESC, t.updated_date DESC
;
