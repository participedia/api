WITH user_bookmarks AS (
  SELECT * FROM (
  SELECT
    bookmarks.thingid as id,
    bookmarks.bookmarktype AS type,
    localized_texts.title,
    things.lead_image,
    things.post_date,
    things.updated_date
  FROM
    bookmarks,
    localized_texts,
    things
  WHERE
    bookmarks.userid = ${userId} AND
    bookmarks.thingid = things.id AND
    bookmarks.thingid = localized_texts.thingid AND
    localized_texts.language = ${language} AND
    bookmarks.bookmarktype = things.type
) t ORDER BY updated_date )

SELECT row_to_json(user_row) as user
FROM (
SELECT
	users.*,
  COALESCE(users.location, ('','','','','','','','','')::geolocation) AS location,
  'user' as type,
	COALESCE(cases_authored, '{}') cases,
	COALESCE(methods_authored, '{}') methods,
	COALESCE(organizations_authored, '{}') organizations,
  COALESCE(ARRAY(SELECT ROW(id, type, title, lead_image, post_date, updated_date)::object_reference FROM user_bookmarks), '{}') bookmarks
FROM
	users LEFT JOIN
	(
	    SELECT DISTINCT
	         array_agg(ROW(authors.thingid, 'case', texts.title, cases.lead_image, cases.post_date, cases.updated_date)::object_reference) cases_authored, authors.user_id
	    FROM
	        localized_texts texts,
	        authors authors,
          cases
	    WHERE
	        texts.language = ${language} AND
	        texts.thingid = authors.thingid AND
          texts.thingid = cases.id
	    GROUP BY
	    	authors.user_id
        HAVING
            authors.user_id = ${userId}
	)
    AS case_authors
    ON case_authors.user_id = users.id LEFT JOIN
	(
	    SELECT DISTINCT
	         array_agg(ROW(authors.thingid, 'method', texts.title, methods.lead_image, methods.post_date, methods.updated_date)::object_reference) methods_authored, authors.user_id
	    FROM
	        localized_texts texts,
	        authors,
          methods
	    WHERE
	        texts.language = ${language} AND
	        texts.thingid = authors.thingid AND
          texts.thingid = methods.id
	    GROUP BY
	    	authors.user_id
        HAVING
            authors.user_id = ${userId}
	)
  AS method_authors
  ON method_authors.user_id = users.id LEFT JOIN
	(
	    SELECT DISTINCT
	         array_agg(ROW(authors.thingid, 'organization', texts.title, organizations.lead_image, organizations.post_date, organizations.updated_date)::object_reference) organizations_authored, authors.user_id
	    FROM
	        localized_texts texts,
	        authors,
          organizations
	    WHERE
	        texts.language = ${language} AND
	        texts.thingid = authors.thingid AND
          texts.thingid = organizations.id
	    GROUP BY
	    	authors.user_id
        HAVING
            authors.user_id = ${userId}
	)
  AS org_authors
  ON org_authors.user_id = users.id
WHERE
	users.id = ${userId}
) user_row
;
