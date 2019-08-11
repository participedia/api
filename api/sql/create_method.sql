WITH insert_method as (
  INSERT into methods (
    type, original_language, post_date, published, updated_date
  )
  VALUES
    (
      'method', ${original_language}, 'now', true, 'now'
    ) RETURNING id as thingid
)

INSERT INTO localized_texts(body, title, description, language, thingid)
VALUES
  (
    ${body},
    ${title},
    ${description},
    ${original_language},
    (select thingid from insert_method)
  ) RETURNING thingid
;
