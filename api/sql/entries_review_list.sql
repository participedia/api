WITH all_hidden_things  AS (
    select * from things, 
    get_localized_texts_fallback(things.id, 'en', things.original_language) AS texts
    where hidden = true and "type" != 'collection' order by updated_date 
),
all_authors as (
    SELECT DISTINCT ON (thingid) *
    FROM  authors 
    ORDER  BY thingid, "timestamp"  DESC NULLS LAST
)
SELECT all_hidden_things.*, all_authors.*
FROM all_hidden_things, all_authors
where all_hidden_things.id = all_authors.thingid
ORDER BY updated_date  DESC
OFFSET 1
LIMIT null