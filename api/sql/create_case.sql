WITH insert_case as (
  INSERT into cases (
    type, original_language, issue, post_date, published, updated_date,
    specific_topic, location, lead_image, other_images, files, videos, tags,
    featured, links
  )
  VALUES
    (
      'case', ${language}, ${issue}, 'now', true, 'now',
      ${specific_topic}, ${location:raw}, ${lead_image:raw}, '{}', '{}', ${videos:raw}, '${tags:raw}', 
      false, '${links:raw}'
    ) RETURNING id as thingid
),
insert_author as (
  INSERT into authors(user_id, timestamp, thingid)
  VALUES
    (${user_id}, 'now', (select thingid from insert_case))
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
