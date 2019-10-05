UPDATE authors
SET user_id = ${user_id}
WHERE thingid = ${thingid} AND
ctid = (SELECT ctid
	FROM authors
	WHERE thingid = ${thingid}
	ORDER BY ctid, timestamp ASC
	LIMIT 1
);