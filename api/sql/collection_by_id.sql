SELECT row_to_json(results.*) as results from (
SELECT * FROM collections
WHERE
  collections.id = ${articleid}
) AS results;
