SELECT
CASE
  WHEN EXISTS
  (
    SELECT 1
    FROM bookmarks
    WHERE bookmarktype = ${type}
      AND thingid = ${thingid}
      AND userid = ${userId}
  )
  THEN true
  ELSE false
END
;
