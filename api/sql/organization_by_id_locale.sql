WITH full_thing AS (
select distinct on (localized_texts."language") *,
    -- not user editable
    id,
    type,
    original_language,
    language,
    post_date,
    published,
    updated_date,
    featured,
    hidden,
    completeness,
    first_author(${articleid}) AS creator,
    last_author(${articleid}) AS last_updated_by,
    get_edit_authors(${articleid}) as edit_history,
    bookmarked('organization', ${articleid}, ${userid}),
    -- user-contributed content
    localized_texts.title,
    localized_texts.description,
    localized_texts.body,
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
    COALESCE(get_object_title_list(collections, ${lang}, organizations.original_language), '{}') as collections
FROM
    organizations
    INNER JOIN localized_texts on thingid = ${articleid}
    -- get_localized_texts_fallback(${articleid}, ${lang}, organizations.original_language) AS texts
WHERE
    organizations.id = ${articleid}
    ORDER BY localized_texts.language, localized_texts.timestamp DESC
)
SELECT to_json(full_thing.*) results FROM full_thing
;