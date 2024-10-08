WITH all_hidden_things  AS (
    SELECT * FROM things
    WHERE "type" != 'collection' and updated_date >= ${post_date} ORDER BY updated_date desc
),
all_authors as (
    SELECT DISTINCT ON (thingid) *
    FROM  authors 
    ORDER  BY thingid, timestamp DESC NULLS LAST
)
SELECT all_authors.*, all_hidden_things.*
FROM all_hidden_things, all_authors
WHERE all_hidden_things.id = all_authors.thingid and user_id = ${user_id}
ORDER BY updated_date  DESC
LIMIT null