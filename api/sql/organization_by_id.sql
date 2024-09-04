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
    first_author(${articleid}) AS creator,
    last_author(${articleid}) AS last_updated_by,
    get_edit_authors(${articleid}) as edit_history,
    bookmarked('organization', ${articleid}, ${userid}),
    -- user-contributed content
    texts.title,
    texts.description,
    texts.body,
    -- media links
    photos,
    files,
    videos,
    links,
    audio,
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
    orginal_entry_id,
    friendly_id
FROM
    organizations,
    get_localized_texts_fallback(${articleid}, ${lang}, organizations.original_language) AS texts
WHERE
    organizations.id = ${articleid}
)
SELECT to_json(full_thing.*) results FROM full_thing
;
