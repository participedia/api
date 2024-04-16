WITH searchresults AS (
  SELECT id, title, description, substring(body for 500) AS body
  FROM search_index_${language:raw}
  WHERE
    document @@ to_tsquery(${langQuery}, ${query})
)

SELECT
  -- not user editable
  organizations.id,
  type,
  original_language,
  post_date,
  published,
  updated_date,
  featured,
  verified,
  reviewed_at,
  reviewed_by,
  hidden,
  completeness,
  first_author(organizations.id) AS creator,
  last_author(organizations.id) AS last_updated_by,
  get_edit_authors(organizations.id) as edit_history,
  bookmarked('organization', organizations.id, ${userid}),
  -- user-contributed content
  texts.title,
  texts.description,
  texts.body,
  -- media links
  to_json(COALESCE(photos, '{}')) AS photos,
  to_json(COALESCE(videos, '{}')) AS videos,
  to_json(COALESCE(files, '{}')) AS files,
  to_json(COALESCE(links, '{}')) AS links,
  to_json(COALESCE(audio, '{}')) AS audio,
  -- text values
  location_name,
  address1,
  address2,
  city,
  province,
  postal_code,
  country,
  -- floats
  latitude,
  longitude,
  -- key values
  sector,
  -- key lists
  scope_of_influence,
  type_method,
  type_tool,
  specific_topics,
  general_issues,
  -- ids
  get_object_title_list(specific_methods_tools_techniques, ${lang}, organizations.original_language) as specific_methods_tools_techniques,
  COALESCE(get_object_title_list(collections, ${lang}, organizations.original_language), '{}') as collections
FROM
  searchresults,
  organizations,
  get_localized_texts_fallback(organizations.id, ${lang}, organizations.original_language) AS texts
WHERE
  searchresults.id = organizations.id AND
  organizations.published = true AND 
  organizations.hidden = false

;
