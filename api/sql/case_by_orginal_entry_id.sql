WITH all_cases  AS (
    SELECT * FROM cases
    WHERE orginal_entry_id = ${articleid}
),
all_authors as (
    SELECT DISTINCT ON (thingid) *
    FROM  authors 
    ORDER  BY thingid, timestamp DESC NULLS LAST
)
SELECT all_authors.*, all_cases.*
FROM all_cases, all_authors
WHERE all_cases.id = all_authors.thingid and user_id = ${userid}
ORDER BY updated_date  DESC
LIMIT 1