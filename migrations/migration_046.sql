---
--- Name: get_edit_authors(thingid); Type: FUNCTION: Schema: public; Owner: -
---

CREATE OR REPLACE FUNCTION get_edit_authors(thingid integer) RETURNS author[]
  LANGUAGE sql STABLE
  AS $_$
WITH a2 AS (
    SELECT
      authors.user_id,
      authors.timestamp,
      users.name
    FROM
      authors,
      users
    WHERE
      authors.user_id = users.id AND
      authors.thingid = $1
    ORDER BY
      authors.user_id,
      authors.timestamp
)
SELECT
    array_agg((
      a2.user_id,
      a2.timestamp,
      a2.name
    )::author) authors
FROM
    a2
$_$;