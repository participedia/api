WITH titles AS (
  SELECT things.type, array_agg((things.id, localized_texts.title)::object_title)
  FROM things, localized_texts
  WHERE things.id = localized_texts.thingid AND
        thing.hidden = false AND
        localized_texts.language = ${language}
  GROUP BY things.type
)

SELECT json_agg(titles.*) results FROM titles;
