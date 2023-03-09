WITH all_hidden_things  AS (
    select * from things, 
    get_localized_texts_fallback(things.id, 'en', things.original_language) AS texts
    where hidden = true and "type" != 'collection' order by updated_date 
),
all_authors as (
    SELECT DISTINCT ON (thingid) *
    FROM  authors 
    ORDER  BY thingid, timestamp  DESC
),
all_users as (
 select name, id, accepted_date from users where accepted_date is null order by id desc
)
SELECT all_hidden_things.*, all_authors.*, all_users.*
FROM all_hidden_things, all_authors, all_users
where all_hidden_things.id = all_authors.thingid and all_authors.user_id = all_users.id
ORDER BY updated_date  DESC
LIMIT null