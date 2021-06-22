WITH full_thing AS (
--   SELECT
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
    bookmarked('method', ${articleid}, ${userid}),
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
    COALESCE(get_object_title_list(collections, ${lang}, methods.original_language), '{}') as collections
FROM
    methods
    INNER JOIN localized_texts on thingid = ${articleid}
WHERE
    methods.id = ${articleid}
    ORDER BY localized_texts.language, localized_texts.timestamp DESC
)
SELECT to_json(full_thing.*) results FROM full_thing
;
