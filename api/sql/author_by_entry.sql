WITH all_users  AS (
    SELECT * FROM users
    ORDER BY id desc
),
all_authors as (
    SELECT DISTINCT ON (user_id) *
    FROM  authors where thingid = ${entry_id}
    ORDER  BY user_id DESC NULLS LAST limit 1
)
SELECT all_authors.*, all_users.*
FROM all_users, all_authors
WHERE all_authors.user_id = all_users.id 
ORDER BY user_id  DESC
LIMIT null