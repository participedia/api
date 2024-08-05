WITH all_things  AS (
    SELECT * FROM things
    WHERE orginal_entry_id = ${articleid}
),
all_authors as (
    SELECT DISTINCT ON (thingid) *
    FROM  authors 
    ORDER  BY thingid, timestamp DESC NULLS LAST
)
SELECT all_authors.*, all_things.*
FROM all_things, all_authors
WHERE all_things.id = all_authors.thingid and user_id = ${userid}
ORDER BY updated_date  DESC
LIMIT 1






