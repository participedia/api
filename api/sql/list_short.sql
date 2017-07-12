
WITH shorts AS (
  SELECT
    things.type,
    array_agg((
      id,
      type,
      title,
      COALESCE(images, '{}'),
      post_date,
      updated_date)::object_short)
  FROM things, localized_texts
  WHERE things.id = localized_texts.thingid AND
        things.hidden = false AND
        localized_texts.language = ${language}
  GROUP BY things.type
)

SELECT json_agg(shorts.*) results FROM shorts;
