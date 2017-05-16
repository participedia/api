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
    method__localized_texts.*,
    to_json(author_list.authors) AS authors,
    to_json(get_related_nouns('case', 'method', ${thingId})) related_cases,
    to_json(get_related_nouns('method', 'method', ${thingId})) related_methods,
    to_json(get_related_nouns('organization', 'method', ${thingId})) related_organizations
FROM
    methods,
    method__localized_texts,
    (
        SELECT
            array_agg(CAST(ROW(
                method__authors.user_id,
                method__authors.timestamp,
                users.name
            )as author)) authors,
            method__authors.method_id
        FROM
            method__authors,
            users
        WHERE
            method__authors.user_id = users.id
        GROUP BY
            method__authors.method_id
    ) AS author_list
WHERE
    methods.id = method__localized_texts.method_id AND
    method__localized_texts.language = ${lang} AND
    author_list.method_id = methods.id AND
    methods.id = ${thingId}
;
