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
    completeness,
    first_author(methods.id) AS creator,
    last_author(methods.id) AS last_updated_by,
    get_edit_authors(methods.id) as edit_history,
    bookmarked('method', methods.id, ${userId}),
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
    COALESCE(get_object_title_list(collections, 'en', methods.original_language), '{}') as collections
FROM
    methods,
    get_localized_texts_fallback(methods.id, 'en', methods.original_language) AS texts
WHERE
    methods.hidden = false
ORDER BY ${sortby:raw} ${orderby:raw}
LIMIT ${limit}
OFFSET ${offset}
)
SELECT to_json(full_thing.*) results FROM full_thing
;
