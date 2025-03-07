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
    first_author(methods.id) AS creator,
    last_author(methods.id) AS last_updated_by,
    get_edit_authors(methods.id) as edit_history,
    bookmarked('method', methods.id, ${userid}),
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
    friendly_id
FROM
    methods,
    get_localized_texts_fallback(methods.id, ${lang}, methods.original_language) AS texts
where methods.published = true and methods.hidden = false
)
SELECT full_thing.* FROM full_thing
;
