WITH insert_collection as (
  INSERT into collections (
    type, original_language, post_date, published, updated_date
  )
  VALUES
    (
      'collection', ${original_language}, 'now', true, 'now'
    ) RETURNING id as thingid
)

INSERT INTO localized_texts(body, title, description, language, thingid, timestamp)
VALUES
  (
    ${body},
    ${title},
    ${description},
    ${original_language},
    (select thingid from insert_collection),
    'now'
  ) RETURNING thingid
;
