SELECT
	id
FROM
	users
WHERE
	email = ${userEmail}
LIMIT
  1
;
