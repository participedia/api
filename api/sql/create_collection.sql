WITH insert_collection as (
  INSERT into collections (
    type, original_language, post_date, published, updated_date, title
  )
  VALUES
    (
      'collection', ${original_language}, 'now', true, 'now', ${title}
    ) RETURNING id as thingid
)

INSERT INTO localized_texts(body, title, description, language, thingid)
VALUES
  (
    ${body},
    ${title},
    ${description},
    ${original_language},
    (select thingid from insert_collection)
  ) RETURNING thingid
;
