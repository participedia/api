WITH
texts AS (
  SELECT * FROM localized_texts
  WHERE localized_texts.language = ${language}
),
user_bookmarks AS (
  SELECT * FROM (
    SELECT
      bookmarks.thingid as id,
      bookmarks.bookmarktype AS type,
      texts.title,
      things.photos,
      things.post_date,
      things.updated_date
    FROM
      bookmarks,
      texts,
      things
    WHERE
      bookmarks.userid = ${userId} AND
      bookmarks.thingid = things.id AND
      bookmarks.thingid = texts.thingid AND
      bookmarks.bookmarktype = things.type
  ) t ORDER BY updated_date
),
authored_things AS (
  SELECT DISTINCT
    authors.user_id author,
    (authors.thingid, texts.title, things.type, things.photos, things.post_date, things.updated_date)::object_short thing,
    authors.thingid,
    things.updated_date
  FROM
    texts,
    authors,
    things
  WHERE
    texts.thingid = authors.thingid AND
    texts.thingid = things.id AND
    authors.user_id = ${userId}
  ORDER BY authors.thingid, things.updated_date
),
authored_cases AS (
  SELECT
     array_agg(thing) cases,
     author
  FROM authored_things
  WHERE (thing).type = 'case'
  GROUP BY author
),
authored_methods AS (
  SELECT
    array_agg(thing) methods,
    author
  FROM authored_things
  WHERE (thing).type = 'method'
  GROUP BY author
),
authored_organizations AS (
  SELECT
    array_agg(thing) organizations,
    author
  FROM authored_things
  WHERE (thing).type = 'organization'
  GROUP BY author
)

SELECT row_to_json(user_row) as user
FROM (
SELECT
	users.*,
  'user' as type,
	COALESCE(authored_cases.cases, '{}') cases,
	COALESCE(authored_methods.methods, '{}') methods,
	COALESCE(authored_organizations.organizations, '{}') organizations,
  COALESCE(ARRAY(SELECT ROW(id, title, type, photos, post_date, updated_date)::object_short FROM user_bookmarks), '{}') bookmarks
FROM
  users
  LEFT JOIN authored_cases ON users.id = authored_cases.author
  LEFT JOIN authored_methods ON users.id = authored_methods.author
  LEFT JOIN authored_organizations ON users.id = authored_organizations.author
WHERE
	users.id = ${userId}
) user_row
;
