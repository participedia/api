WITH insert_case as (
  INSERT into cases (
    type, original_language, post_date, published, updated_date
  )
  VALUES
    (
      'case', ${original_language}, 'now', true, 'now'
    ) RETURNING id as thingid
)

INSERT INTO localized_texts(body, title, description, language, thingid, timestamp)
VALUES
  (
    ${body},
    ${title},
    ${description},
    ${original_language},
    (select thingid from insert_case),
    'now'
  ) RETURNING thingid
;
