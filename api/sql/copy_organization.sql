WITH insert_organization as (
  INSERT into organizations (
    type, original_language, post_date, published, updated_date, hidden, orginal_entry_id
  )
  VALUES
    (
      'organization', ${original_language}, 'now', true, 'now', ${hidden}, ${orginal_entry_id}
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
