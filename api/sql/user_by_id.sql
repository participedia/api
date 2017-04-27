WITH user_bookmarks AS (
  SELECT
    bookmarks.thingid as id,
    bookmarks.bookmarktype AS type,
    case__localized_texts.title,
    cases.lead_image,
    cases.post_date,
    cases.updated_date
  FROM
    bookmarks,
    case__localized_texts,
    cases
  WHERE
    bookmarks.userid = ${userId} AND
    bookmarks.thingid = cases.id AND
    bookmarks.thingid = case__localized_texts.case_id AND
    case__localized_texts.language = ${language} AND
    bookmarks.bookmarktype = 'case'
UNION
  SELECT
    bookmarks.thingid as id,
    bookmarks.bookmarktype AS type,
    method__localized_texts.title,
    methods.lead_image,
    methods.post_date,
    methods.updated_date
  FROM
    bookmarks,
    method__localized_texts,
    methods
  WHERE
    bookmarks.userid = ${userId} AND
    bookmarks.thingid = methods.id AND
    bookmarks.thingid = method__localized_texts.method_id AND
    method__localized_texts.language = ${language} AND
    bookmarks.bookmarktype = 'method'
UNION
  SELECT
    bookmarks.thingid as id,
    bookmarks.bookmarktype as TYPE,
    organization__localized_texts.title,
    organizations.lead_image,
    organizations.post_date,
    organizations.updated_date
  FROM
    bookmarks,
    organization__localized_texts,
    organizations
  WHERE
    bookmarks.userid = ${userId} AND
    bookmarks.thingid = organizations.id AND
    bookmarks.thingid = organization__localized_texts.organization_id AND
    organization__localized_texts.language = ${language} AND
    bookmarks.bookmarktype = 'organization'
)

SELECT
	users.name,
	users.id,
  users.join_date,
  users.picture_url,
  'user' as type,
	to_json(COALESCE(cases_authored, '{}')) cases,
	to_json(COALESCE(methods_authored, '{}')) methods,
	to_json(COALESCE(organizations_authored, '{}')) organizations,
  to_json(COALESCE(ARRAY(SELECT ROW(id, type, title, lead_image, post_date, updated_date)::object_reference FROM user_bookmarks), '{}')) bookmarks
FROM
	users LEFT JOIN
	(
	    SELECT DISTINCT
	         array_agg(ROW(authors.case_id, 'case', texts.title, cases.lead_image, cases.post_date, cases.updated_date)::object_reference) cases_authored, authors.user_id
	    FROM
	        case__localized_texts texts,
	        case__authors authors,
          cases
	    WHERE
	        texts.language = ${language} AND
	        texts.case_id = authors.case_id AND
          texts.case_id = cases.id
	    GROUP BY
	    	authors.user_id
        HAVING
            authors.user_id = ${userId}
	) AS case_authors ON case_authors.user_id = users.id LEFT JOIN
	(
	    SELECT DISTINCT
	         array_agg(ROW(authors.method_id, 'method', texts.title, methods.lead_image, methods.post_date, methods.updated_date)::object_reference) methods_authored, authors.user_id
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
	         array_agg(ROW(authors.organization_id, 'organization', texts.title, organizations.lead_image, organizations.post_date, organizations.updated_date)::object_reference) organizations_authored, authors.user_id
	    FROM
	        organization__localized_texts texts,
	        organization__authors authors,
          organizations
	    WHERE
	        texts.language = ${language} AND
	        texts.organization_id = authors.organization_id AND
          texts.organization_id = organizations.id
	    GROUP BY
	    	authors.user_id
        HAVING
            authors.user_id = ${userId}
	) AS org_authors  ON org_authors.user_id = users.id
WHERE
	users.id = ${userId}
;
