WITH all_methods  AS (
    SELECT * FROM methods
    WHERE orginal_entry_id = ${articleid}
),
all_authors as (
    SELECT DISTINCT ON (thingid) *
    FROM  authors 
    ORDER  BY thingid, timestamp DESC NULLS LAST
)
SELECT all_authors.*, all_methods.*
FROM all_methods, all_authors
WHERE all_methods.id = all_authors.thingid and user_id = ${userid}
ORDER BY updated_date  DESC
LIMIT 1