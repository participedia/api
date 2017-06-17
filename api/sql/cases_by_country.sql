SELECT
    (location).country, count((location).country)
FROM
    cases
WHERE
	(location).country is not null AND
  hidden = false
GROUP BY
	(location).country
ORDER BY
	(location).country
;
