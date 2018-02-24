SELECT
    country, count(country)
FROM
    cases
WHERE
	country is not null AND
  hidden = false
GROUP BY
	country
ORDER BY
	country
;
