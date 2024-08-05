WITH insert_case as (
  INSERT into cases (
    type, original_language, post_date, published, updated_date, hidden, orginal_entry_id
  )
  VALUES
    (
     'case', ${original_language}, 'now', true, 'now', ${hidden}, ${orginal_entry_id}
    ) RETURNING id as thingid
)

INSERT INTO localized_texts(body, title, description, language, thingid, timestamp)
VALUES
  (
    ${body},
    ${title},
    ${description},
    ${local_language},
    (select thingid from insert_case),
    'now'
  ) RETURNING thingid
;
