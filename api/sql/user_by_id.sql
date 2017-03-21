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
	         array_agg(ROW(authors.case_id, texts.title)) cases_authored, authors.user_id
	    FROM
	        case__localized_texts texts,
	        case__authors authors
	    WHERE
	        texts.language = ${language} AND
	        texts.case_id = authors.case_id
	    GROUP BY
	    	authors.user_id
        HAVING
            authors.user_id = ${userId}
	) AS case_authors ON case_authors.user_id = users.id LEFT JOIN
	(
	    SELECT DISTINCT
	         array_agg(ROW(authors.method_id, texts.title)) methods_authored, authors.user_id
	    FROM
	        method__localized_texts texts,
	        method__authors authors
	    WHERE
	        texts.language = ${language} AND
	        texts.method_id = authors.method_id
	    GROUP BY
	    	authors.user_id
        HAVING
            authors.user_id = ${userId}
	) AS method_authors ON method_authors.user_id = users.id LEFT JOIN
	(
	    SELECT DISTINCT
	         array_agg(ROW(authors.organization_id, texts.title)) organizations_authored, authors.user_id
	    FROM
	        organization__localized_texts texts,
	        organization__authors authors
	    WHERE
	        texts.language = ${language} AND
	        texts.organization_id = authors.organization_id
	    GROUP BY
	    	authors.user_id
        HAVING
            authors.user_id = ${userId}
	) AS org_authors  ON org_authors.user_id = users.id
WHERE
	users.id = ${userId}
;
