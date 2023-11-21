WITH all_organizations As (
SELECT
  id,
  type,
  CASE 
    WHEN type='case' THEN get_completeness_case(organizations.id)
    WHEN type='method' THEN get_completeness_methods(organizations.id)
    WHEN type='organization' THEN get_completeness_organizations(organizations.id)
    ELSE ''
    END as completeness,
  published,
  featured,
  verified,
  location_name,
  address1,
  address2,
  city,
  province,
  postal_code,
  country,
  latitude,
  longitude,
  original_language,
  texts.title,
  texts.description,
  texts.body,
  to_json(COALESCE(photos, '{}')) AS photos,
  to_json(COALESCE(videos, '{}')) AS videos,
  updated_date,
  post_date,
  bookmarked(organizations.type, organizations.id, ${userId})
FROM 
  organizations,
  get_localized_texts_fallback(organizations.id, ${language}, organizations.original_language) AS texts
WHERE organizations.published = true AND organizations.hidden = false
)
SELECT all_organizations.* FROM all_organizations LIMIT ${limit} OFFSET ${offset};