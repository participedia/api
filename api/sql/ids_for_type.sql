SELECT
    things.id
FROM
    things
WHERE
    things.type = $(type)
ORDER BY
    things.id
;
