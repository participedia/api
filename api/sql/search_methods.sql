SELECT
    id,
    type,
    original_language,
    best_for,
    communication_mode,
    decision_method,
    facilitated,
    governance_contribution,
    issue_interdependency,
    issue_polarization,
    issue_technical_complexity,
    kind_of_influence,
    method_of_interaction,
    public_interaction_method,
    post_date,
    published,
    typical_funding_source,
    typical_implementing_entity,
    updated_date,
    lead_image,
    other_images,
    files,
    videos,
    tags,
    title,
    body,
    authors
FROM
    (
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
            setweight(to_tsvector(coalesce(methods.original_language, '')), 'C') ||
            setweight(to_tsvector(coalesce(methods.best_for, '')), 'B') ||
            setweight(to_tsvector(coalesce(methods.communication_mode, '')), 'B') ||
            setweight(to_tsvector(coalesce(methods.decision_method, '')), 'B') ||
            setweight(to_tsvector(coalesce(methods.governance_contribution, '')), 'C') ||
            setweight(to_tsvector(coalesce(methods.issue_interdependency, '')), 'C') ||
            setweight(to_tsvector(coalesce(methods.issue_polarization, '')), 'C') ||
            setweight(to_tsvector(coalesce(methods.issue_technical_complexity, '')), 'C') ||
            setweight(to_tsvector(coalesce(methods.kind_of_influence, '')), 'C') ||
            setweight(to_tsvector(coalesce(methods.method_of_interaction, '')), 'C') ||
            setweight(to_tsvector(coalesce(methods.public_interaction_method, '')), 'B') ||
            setweight(to_tsvector(coalesce(methods.typical_funding_source, '')), 'C') ||
            setweight(to_tsvector(coalesce(methods.typical_implementing_entity, '')), 'C') ||
            setweight(to_tsvector(coalesce(methods.typical_sponsoring_entity, '')), 'C') ||
            setweight(to_tsvector(coalesce(method__localized_texts.title, '')), 'A') ||
            setweight(to_tsvector(coalesce(method__localized_texts.body, '')), 'A') as document
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
            method__localized_texts.language = ${language} AND
            author_list.method_id = methods.id
    ) AS docsearch
WHERE
    docsearch.document @@ to_tsquery(${query})
ORDER BY
    ts_rank(docsearch.document, to_tsquery(${query})) DESC
LIMIT ${limit}
OFFSET ${offset}
;
