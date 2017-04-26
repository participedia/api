SELECT
	users.name,
	users.id,
    'user' as type,
	to_json(cases_authored) cases,
	to_json(methods_authored) methods,
	to_json(organizations_authored) organizations
FROM
	users LEFT JOIN
	(
	    SELECT DISTINCT
	         array_agg(ROW(authors.case_id, 'case', texts.title, cases.lead_image)::object_reference) cases_authored, authors.user_id
	    FROM
	        case__localized_texts texts,
	        case__authors authors,
          cases
	    WHERE
	        texts.language = ${language} AND
	        texts.case_id = authors.case_id,
          texts.case_id = cases.id
	    GROUP BY
	    	authors.user_id
        HAVING
            authors.user_id = ${userId}
	) AS case_authors ON case_authors.user_id = users.id LEFT JOIN
	(
	    SELECT DISTINCT
	         array_agg(ROW(authors.method_id, 'method', texts.title, methods.lead_image)::object_reference) methods_authored, authors.user_id
	    FROM
	        method__localized_texts texts,
	        method__authors authors,
          methods
	    WHERE
	        texts.language = ${language} AND
	        texts.method_id = authors.method_id AND
          texts.method_id = methods.id
	    GROUP BY
	    	authors.user_id
        HAVING
            authors.user_id = ${userId}
	) AS method_authors ON method_authors.user_id = users.id LEFT JOIN
	(
	    SELECT DISTINCT
	         array_agg(ROW(authors.organization_id, 'organization', texts.title, organizations.lead_image)::object_reference) organizations_authored, authors.user_id
	    FROM
	        organization__localized_texts texts,
	        organization__authors authors,
          organizations
	    WHERE
	        texts.language = ${language} AND
	        texts.organization_id = authors.organization_id
          texts.organization_id = organization.id
	    GROUP BY
	    	authors.user_id
        HAVING
            authors.user_id = ${userId}
	) AS org_authors  ON org_authors.user_id = users.id
WHERE
	users.id = ${userId}
;
