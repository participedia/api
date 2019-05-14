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
    hidden,
    first_author(${articleid}) AS creator,
    last_author(${articleid}) AS last_updated_by,
    bookmarked('method', ${articleid}, ${userid}),
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
    get_object_title_list(specific_methods_tools_techniques, ${lang}) as specific_methods_tools_techniques
FROM
    organizations,
    get_localized_texts(${articleid}, ${lang}) AS texts
WHERE
    organizations.id = ${articleid}
)
SELECT to_json(full_thing.*) results FROM full_thing
;