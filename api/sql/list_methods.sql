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
    to_json(author_list.authors) AS authors
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
    localized_texts.language = ${language} AND
    ${facets:raw}
    author_list.thingid = methods.id
${order_by:raw}
LIMIT ${limit}
OFFSET ${offset}
;
