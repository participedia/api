WITH full_thing AS (
  SELECT
    -- not user editable
    id,
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
    COALESCE(get_object_title_list(collections, ${lang}, organizations.original_language), '{}') as collections,
    friendly_id
FROM
    organizations,
    get_localized_texts_fallback(organizations.id, ${lang}, organizations.original_language) AS texts
where organizations.published = true and organizations.hidden = false
)
SELECT full_thing.* FROM full_thing
;
