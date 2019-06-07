WITH all_titles AS
(SELECT id, get_title(id, ${lang}) title, hidden
 FROM ${type:name}
 ORDER BY title)
SELECT *
FROM all_titles
WHERE title IS NOT NULL;
