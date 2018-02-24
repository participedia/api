WITH insert_organization as (
  INSERT into organizations (
    type, original_language, post_date, published, updated_date
  )
  VALUES
    (
      'organization', ${language}, 'now', true, 'now'
    ) RETURNING id as thingid
)

INSERT INTO localized_texts(body, title, description, language, thingid)
VALUES
  (
    ${body},
    ${title},
    ${description},
    ${language},
    (select thingid from insert_organization)
  ) RETURNING thingid
;
