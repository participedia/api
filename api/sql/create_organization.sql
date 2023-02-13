WITH insert_organization as (
  INSERT into organizations (
    type, original_language, post_date, published, updated_date, hidden
  )
  VALUES
    (
      'organization', ${original_language}, 'now', true, 'now', ${hidden}
    ) RETURNING id as thingid
)

INSERT INTO localized_texts(body, title, description, language, thingid, timestamp)
VALUES
  (
    ${body},
    ${title},
    ${description},
    ${original_language},
    (select thingid from insert_organization),
    'now'
  ) RETURNING thingid
;
