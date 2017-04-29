WITH  related_cases AS (
  SELECT
      ARRAY(  SELECT
        ROW(method__related_cases.related_case_id,
        'case',
        case__localized_texts.title,
        cases.lead_image,
        cases.post_date,
        cases.updated_date)::object_reference
      FROM
        method__related_cases,
        case__localized_texts,
        cases
      WHERE
        method__related_cases.method_id = ${methodId} AND
        method__related_cases.related_case_id = case__localized_texts.case_id AND
        method__related_cases.related_case_id = cases.id AND
        case__localized_texts.language = ${lang}
      )
    ),

 related_methods  AS (
   SELECT
      ARRAY(  SELECT
        ROW(method__related_methods.related_method_id,
        'method',
        method__localized_texts.title,
        methods.lead_image,
        methods.post_date,
        methods.updated_date)::object_reference
      FROM
        method__related_methods,
        method__localized_texts,
        methods
      WHERE
        method__related_methods.method_id = ${methodId} AND
        method__related_methods.related_method_id = method__localized_texts.method_id AND
        method__related_methods.related_method_id = methods.id AND
        method__localized_texts.language = ${lang}
      )
    ),
related_organizations AS (
  SELECT
      ARRAY(  SELECT
        ROW(method__related_organizations.related_organization_id,
        'organization',
        organization__localized_texts.title,
        organizations.lead_image,
        organizations.post_date,
        organizations.updated_date)::object_reference
      FROM
        method__related_organizations,
        organization__localized_texts,
        organizations
      WHERE
        method__related_organizations.method_id = ${methodId} AND
        method__related_organizations.related_organization_id = organization__localized_texts.organization_id AND
        method__related_organizations.related_organization_id = organizations.id AND
        organization__localized_texts.language = ${lang}
      )
    )

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
    to_json(related_cases.array) related_cases,
    to_json(related_methods.array) related_methods,
    to_json(related_organizations.array) related_organizations
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
    ) AS author_list,
    related_cases,
    related_methods,
    related_organizations
WHERE
    methods.id = method__localized_texts.method_id AND
    method__localized_texts.language = ${lang} AND
    author_list.method_id = methods.id AND
    methods.id = ${methodId}
;
