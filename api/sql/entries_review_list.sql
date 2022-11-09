WITH all_hidden_things  AS (
    SELECT * FROM things, 
    get_localized_texts_fallback(things.id, 'en', things.original_language) AS texts
    WHERE hidden = true and "type" != 'collection' ORDER BY updated_date 
),
all_authors as (
    SELECT DISTINCT ON (thingid) *
    FROM  authors 
    ORDER  BY thingid, "timestamp"  DESC NULLS LAST
),
all_users as (
    SELECT name, id FROM users ORDER BY id desc
)
SELECT all_hidden_things.*, all_authors.*, all_users.*
FROM all_hidden_things, all_authors, all_users
WHERE all_hidden_things.id = all_authors.thingid and all_authors.user_id = all_users.id
ORDER BY updated_date  DESC
OFFSET 1
LIMIT null