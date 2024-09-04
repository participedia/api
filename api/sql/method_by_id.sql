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
    published,
    hidden,
    verified,
    reviewed_at,
    reviewed_by,
    completeness,
    first_author(${articleid}) AS creator,
    last_author(${articleid}) AS last_updated_by,
    get_edit_authors(${articleid}) as edit_history,
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
    -- key values
    facilitators,
    facetoface_online_or_both,
    public_spectrum,
    open_limited,
    recruitment_method,
    level_polarization,
    level_complexity,
    -- key lists
    method_types,
    number_of_participants,
    scope_of_influence,
    participants_interactions,
    decision_methods,
    if_voting,
    purpose_method,
    COALESCE(get_object_title_list(collections, ${lang}, methods.original_language), '{}') as collections,
    orginal_entry_id,
    friendly_id
FROM
    methods,
    get_localized_texts_fallback(${articleid}, ${lang}, methods.original_language) AS texts
WHERE
    methods.id = ${articleid}
)
SELECT to_json(full_thing.*) results FROM full_thing
;
