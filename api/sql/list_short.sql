
WITH shorts AS (
  SELECT things.type, array_agg((id, type, title, lead_image, post_date, updated_date)::object_reference)
  FROM things, localized_texts
  WHERE things.id = localized_texts.thingid AND
        localized_texts.language = ${language}
  GROUP BY things.type
)

SELECT json_agg(shorts.*) results FROM shorts;
