SELECT DISTINCT ON (user_id) *
    FROM  authors where thingid = ${entry_id}
    ORDER  BY user_id DESC NULLS LAST limit 1