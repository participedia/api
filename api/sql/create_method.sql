WITH insert_method as (
  INSERT into methods (
    id, type, original_language, post_date, published, updated_date
  )
  VALUES
    (
      (SELECT MAX(id)+1 FROM methods), 'method', ${original_language}, 'now', true, 'now'
    ) RETURNING id as thingid
)

INSERT INTO localized_texts(body, title, description, language, thingid, timestamp)
VALUES
  (
    ${body},
    ${title},
    ${description},
    ${original_language},
    (select thingid from insert_method),
    'now'
  ) RETURNING thingid
;
