SELECT
    id,
    type,
    original_language,
    issue,
    communication_mode,
    communication_with_audience,
    content_country,
    decision_method,
    end_date,
    facetoface_online_or_both,
    facilitated,
    voting,
    number_of_meeting_days,
    ongoing,
    post_date,
    published,
    start_date,
    total_number_of_participants,
    updated_date,
    targeted_participant_demographic,
    kind_of_influence,
    targeted_participants_public_role,
    targeted_audience,
    participant_selection,
    specific_topic,
    staff_type,
    type_of_funding_entity,
    typical_implementing_entity,
    typical_sponsoring_entity,
    who_else_supported_the_initiative,
    who_was_primarily_responsible_for_organizing_the_initiative,
    location,
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
            cases.id,
            'case' as type,
            cases.original_language,
            cases.issue,
            cases.communication_mode,
            cases.communication_with_audience,
            cases.content_country,
            cases.decision_method,
            cases.end_date,
            cases.facetoface_online_or_both,
            cases.facilitated,
            cases.voting,
            cases.number_of_meeting_days,
            cases.ongoing,
            cases.post_date,
            cases.published,
            cases.start_date,
            cases.total_number_of_participants,
            cases.updated_date,
            cases.targeted_participant_demographic,
            cases.kind_of_influence,
            cases.targeted_participants_public_role,
            cases.targeted_audience,
            cases.participant_selection,
            cases.specific_topic,
            cases.staff_type,
            cases.type_of_funding_entity,
            cases.typical_implementing_entity,
            cases.typical_sponsoring_entity,
            cases.who_else_supported_the_initiative,
            cases.who_was_primarily_responsible_for_organizing_the_initiative,
            to_json(cases.location) AS location,
            to_json(cases.lead_image) AS lead_image,
            to_json(COALESCE(cases.other_images, '{}')) AS other_images,
            to_json(COALESCE(cases.files, '{}')) AS files,
            to_json(COALESCE(cases.videos, '{}')) AS videos,
            to_json(COALESCE(cases.tags, '{}')) AS tags,
            case__localized_texts.*,
            to_json(author_list.authors) authors,
            setweight(to_tsvector(coalesce(cases.original_language, '')), 'C') ||
            setweight(to_tsvector(coalesce(cases.issue, '')), 'B') ||
            setweight(to_tsvector(coalesce(cases.communication_mode, '')), 'B') ||
            setweight(to_tsvector(coalesce(cases.communication_with_audience, '')), 'B') ||
            setweight(to_tsvector(coalesce(cases.content_country, '')), 'B') ||
            setweight(to_tsvector(coalesce(cases.decision_method, '')), 'B') ||
            setweight(to_tsvector(coalesce(cases.facilitated, '')), 'C') ||
            setweight(to_tsvector(coalesce(cases.targeted_participant_demographic, '')), 'C') ||
            setweight(to_tsvector(coalesce(cases.kind_of_influence, '')), 'C') ||
            setweight(to_tsvector(coalesce(cases.targeted_participants_public_role, '')), 'C') ||
            setweight(to_tsvector(coalesce(cases.targeted_audience, '')), 'C') ||
            setweight(to_tsvector(coalesce(cases.participant_selection, '')), 'C') ||
            setweight(to_tsvector(coalesce(cases.specific_topic, '')), 'B') ||
            setweight(to_tsvector(coalesce(cases.staff_type, '')), 'C') ||
            setweight(to_tsvector(coalesce(cases.type_of_funding_entity, '')), 'C') ||
            setweight(to_tsvector(coalesce(cases.typical_implementing_entity, '')), 'C') ||
            setweight(to_tsvector(coalesce(cases.typical_sponsoring_entity, '')), 'C') ||
            setweight(to_tsvector(coalesce(cases.who_else_supported_the_initiative, '')), 'C') ||
            setweight(to_tsvector(coalesce(case__localized_texts.title, '')), 'A') ||
            setweight(to_tsvector(coalesce(case__localized_texts.body, '')), 'A') as document
        FROM
            cases,
            case__localized_texts,
            (
                SELECT
                    array_agg(CAST(ROW(
                        case__authors.user_id,
                        case__authors.timestamp,
                        users.name
                    ) AS author)) authors,
                    case__authors.case_id
                FROM
                    case__authors,
                    users
                WHERE
                    case__authors.user_id = users.id
                GROUP BY
                    case__authors.case_id
            ) AS author_list
        WHERE
            cases.id = case__localized_texts.case_id AND
            case__localized_texts.language = ${language} AND
            author_list.case_id = cases.id
    ) AS docsearch
WHERE
    docsearch.document @@ to_tsquery(${query})
ORDER BY
    ts_rank(docsearch.document, to_tsquery(${query})) DESC
LIMIT ${limit}
OFFSET ${offset}
;

-- SELECT case__methods.method_id, method__localized_texts.title FROM case__methods, method__localized_texts WHERE case__methods.case_id = ${caseId} AND case__methods.method_id = method__localized_texts.method_id;
