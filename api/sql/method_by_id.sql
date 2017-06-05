SELECT
    methods.id,
    'method' as type,
    methods.original_language,
    methods.best_for,
    methods.communication_mode,
    methods.decision_method,
    methods.facilitated,
    methods.governance_contribution,
    methods.issue_interdependency,
    methods.issue_polarization,
    methods.issue_technical_complexity,
    methods.kind_of_influence,
    methods.method_of_interaction,
    methods.public_interaction_method,
    methods.post_date,
    methods.published,
    methods.typical_funding_source,
    methods.typical_implementing_entity,
    methods.typical_sponsoring_entity,
    methods.updated_date,
    to_json(methods.lead_image) AS lead_image,
    to_json(COALESCE(methods.other_images, '{}')) AS other_images,
    to_json(COALESCE(methods.files, '{}')) AS files,
    to_json(COALESCE(methods.videos, '{}')) AS videos,
    to_json(COALESCE(methods.tags, '{}')) AS tags,
    localized_texts.body,
    localized_texts.title,
    to_json(author_list.authors) AS authors,
    to_json(get_related_nouns('case', 'method', ${thingid}, ${lang} )) related_cases,
    to_json(get_related_nouns('method', 'method', ${thingid}, ${lang} )) related_methods,
    to_json(get_related_nouns('organization', 'method', ${thingid}, ${lang} )) related_organizations,
    bookmarked('case', ${thingid}, ${userId})
FROM
    methods,
    localized_texts,
    (
        SELECT
            array_agg(CAST(ROW(
                authors.user_id,
                authors.timestamp,
                users.name
            )as author)) authors,
            authors.thingid
        FROM
            authors,
            users
        WHERE
            authors.user_id = users.id
        GROUP BY
            authors.thingid
    ) AS author_list
WHERE
    methods.id = localized_texts.thingid AND
    localized_texts.language = ${lang} AND
    author_list.thingid = methods.id AND
    methods.id = ${thingid}
;
