SELECT row_to_json(results.*) as results from (
SELECT
  id,
  type,
  featured,
  title,
  description,
  post_date,
  updated_date,
  bookmarked,
  photos
FROM
  collections
WHERE
  collections.id = ${articleid}
) AS results;
