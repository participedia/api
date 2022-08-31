-- Parameters
-- query
-- language (defaults to 'en'
-- offset (defaults to 1)
-- limit (20 for now)
-- userid (may be null)
WITH all_selections AS (SELECT
  id,
  title,
  description,
  substring(body for 500) AS body,
  ts_rank_cd(search_index_${language:raw}.document, to_tsquery(${langQuery}, ${query})) as rank
FROM search_index_${language:raw}
WHERE
  document @@ to_tsquery(${langQuery}, ${query})
ORDER BY rank DESC
),
total_selections AS (
  SELECT count(all_selections.id) AS total
  FROM all_selections, ${type:name}
  WHERE all_selections.id = ${type:name}.id AND ${type:name}.published = true AND ${type:name}.hidden = false ${facets:raw}
)

SELECT
  ${type:name}.id,
  ${type:name}.type,
  CASE 
		WHEN ${type:name}.type='case' THEN get_completeness_case(${type:name}.id)
		WHEN ${type:name}.type='method' THEN get_completeness_methods(${type:name}.id)
		WHEN ${type:name}.type='organization' THEN get_completeness_organizations(${type:name}.id)
		ELSE ''
     END as completeness,
  ${type:name}.published,
  ${type:name}.featured,
  ${type:name}.verified,
  ${type:name}.location_name,
  ${type:name}.address1,
  ${type:name}.address2,
  ${type:name}.city,
  ${type:name}.province,
  ${type:name}.postal_code,
  ${type:name}.country,
  ${type:name}.latitude,
  ${type:name}.longitude,
  texts.title,
  texts.description,
  texts.body,
  -- to_json(get_location(${type:name}.id)) AS location,
  to_json(COALESCE(${type:name}.photos, '{}')) AS photos,
  to_json(COALESCE(${type:name}.videos, '{}')) AS videos,
  ${type:name}.updated_date,
  ${type:name}.post_date,
  bookmarked(${type:name}.type, ${type:name}.id, ${userId}),
  total_selections.total,
  all_selections.rank
FROM
  all_selections,
  total_selections,
  ${type:name},
  get_localized_texts_fallback(${type:name}.id, ${language}, ${type:name}.original_language) AS texts
WHERE
  all_selections.id = ${type:name}.id AND
  ${type:name}.published = true AND
  ${type:name}.hidden = false
  ${facets:raw}
ORDER BY all_selections.rank DESC
OFFSET ${offset}
LIMIT ${limit}
;
