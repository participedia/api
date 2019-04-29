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
    -- key values
    facetoface_online_or_both,
    public_spectrum,
    open_limited,
    recruitment_method,
    level_polarization,
    -- key lists
    method_types,
    number_of_participants,
    scope_of_influence,
    participants_interactions,
    decision_methods,
    if_voting,
    -- boolean
    facilitator
FROM
    methods,
    get_localized_texts(${articleid}, ${lang}) AS texts
WHERE
    methods.id = ${articleid}
)
SELECT to_json(full_thing.*) results FROM full_thing
;
