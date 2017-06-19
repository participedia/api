WITH insert_case as (
  INSERT into cases (
    type, original_language, post_date, published, updated_date
  )
  VALUES
    (
      'case', ${language}, 'now', true, 'now'
    ) RETURNING id as thingid
)

INSERT INTO localized_texts(body, title, language, thingid)
VALUES
  (
    ${body},
    ${title},
    ${language},
    (select thingid from insert_case)
  ) RETURNING thingid
;
