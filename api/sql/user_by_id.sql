WITH user_bookmarks AS (
  SELECT * FROM (
  SELECT
    bookmarks.thingid as id,
    bookmarks.bookmarktype AS type,
    localized_texts.title,
    things.images,
--    COALLESCE(things.images, '{}') AS images,
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
  COALESCE(ARRAY(SELECT ROW(id, title, type, images, post_date, updated_date)::object_short FROM user_bookmarks), '{}') bookmarks
FROM
	users LEFT JOIN
	(
	    SELECT DISTINCT
	         array_agg(ROW(authors.thingid, 'case', texts.title, cases.images, cases.post_date, cases.updated_date)::object_short) cases_authored, authors.user_id
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
	         array_agg(ROW(authors.thingid, 'method', texts.title, methods.images, methods.post_date, methods.updated_date)::object_short) methods_authored, authors.user_id
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
	         array_agg(ROW(authors.thingid, 'organization', texts.title, organizations.images, organizations.post_date, organizations.updated_date)::object_short) organizations_authored, authors.user_id
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
