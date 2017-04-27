WITH  related_cases AS (
  SELECT
      ARRAY(  SELECT
        ROW(organization__related_cases.related_case_id,
        'case',
        case__localized_texts.title,
        cases.lead_image)::object_reference
      FROM
        organization__related_cases,
        case__localized_texts,
        cases
      WHERE
        organization__related_cases.organization_id = ${organizationId} AND
        organization__related_cases.related_case_id = case__localized_texts.case_id AND
        organization__related_cases.related_case_id = cases.id AND
        case__localized_texts.language = ${lang}
      )
    ),

 related_methods  AS (
   SELECT
      ARRAY(  SELECT
        ROW(organization__related_methods.related_method_id,
        'method',
        method__localized_texts.title,
        methods.lead_image)::object_reference
      FROM
        organization__related_methods,
        method__localized_texts,
        methods
      WHERE
        organization__related_methods.organization_id = ${organizationId} AND
        organization__related_methods.related_method_id = method__localized_texts.method_id AND
        organization__related_methods.related_method_id = methods.id AND
        method__localized_texts.language = ${lang}
      )
    ),
related_organizations AS (
  SELECT
      ARRAY(  SELECT
        ROW(organization__related_organizations.related_organization_id,
        'organization',
        organization__localized_texts.title,
        organizations.lead_image)::object_reference
      FROM
        organization__related_organizations,
        organization__localized_texts,
        organizations
      WHERE
        organization__related_organizations.organization_id = ${organizationId} AND
        organization__related_organizations.related_organization_id = organization__localized_texts.organization_id AND
        organization__related_organizations.related_organization_id = organizations.id AND
        organization__localized_texts.language = ${lang}
      )
    )

SELECT
    organizations.id,
    'organization' as type,
    organizations.original_language,
    organizations.executive_director,
    organizations.issue,
    organizations.post_date,
    organizations.published,
    organizations.sector,
    organizations.updated_date,
    to_json(
    	COALESCE(
    		organizations.location,
    		CAST(
    			ROW('', '', '', '', '', '', '', '', '')
    			as geolocation
    		)
    	)
    ) AS location,
    to_json(organizations.lead_image) AS lead_image,
    to_json(COALESCE(organizations.other_images, '{}')) AS other_images,
    to_json(COALESCE(organizations.files, '{}')) AS files,
    to_json(COALESCE(organizations.videos, '{}')) AS videos,
    to_json(COALESCE(organizations.tags, '{}')) AS tags,
    organization__localized_texts.*,
    to_json(author_list.authors) AS authors,
    to_json(related_cases.array) related_cases,
    to_json(related_methods.array) related_methods,
    to_json(related_organizations.array) related_organizations

FROM
    organizations,
    organization__localized_texts,
    (
        SELECT
            array_agg(CAST(ROW(
                organization__authors.user_id,
                organization__authors.timestamp,
                users.name
            ) AS author )) authors,
            organization__authors.organization_id
        FROM
            organization__authors,
            users
        WHERE
            organization__authors.user_id = users.id
        GROUP BY
            organization__authors.organization_id
    ) AS author_list,
    related_cases,
    related_methods,
    related_organizations
WHERE
    organizations.id = organization__localized_texts.organization_id AND
    organization__localized_texts.language = ${lang} AND
    author_list.organization_id = organizations.id AND
    organizations.id = ${organizationId}
;
