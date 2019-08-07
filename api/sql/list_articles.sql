-- get titles for specified language, with fallback to article's original language
WITH all_titles AS
(SELECT id, get_title(id, coalesce(
  (
    select language from localized_texts where language = ${lang} and thingid = id limit 1
  ),
  ${type:name}.original_language
)) title, hidden
 FROM ${type:name}
 ORDER BY title)
SELECT *
FROM all_titles
WHERE title IS NOT NULL
AND hidden IS NOT TRUE;
