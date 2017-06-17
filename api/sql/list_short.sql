
WITH shorts AS (
  SELECT
    things.type,
    array_agg((
      id,
      type,
      title,
      COALESCE(lead_image, '("","",0)'::attachment), 
      post_date,
      updated_date)::object_reference)
  FROM things, localized_texts
  WHERE things.id = localized_texts.thingid AND
        things.hidden = false AND
        localized_texts.language = ${language}
  GROUP BY things.type
)

SELECT json_agg(shorts.*) results FROM shorts;
