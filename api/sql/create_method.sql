WITH insert_method as (
  INSERT into methods (
    type, original_language, post_date, published, updated_date,
    lead_image, other_images, files, videos, tags, featured, links
  )
  VALUES
    (
      'method', ${language}, 'now', true, 'now',
      ${lead_image:raw}, '{}', '{}', ${videos:raw}, '${tags:raw}', false, '{$links:raw}'
    ) RETURNING id as thingid
),
insert_author as (
  INSERT into authors(user_id, timestamp, thingid)
  VALUES
    (${user_id}, 'now', (select thingid from insert_method))
)

INSERT INTO localized_texts(body, title, language, thingid)
VALUES
  (
    ${body},
    ${title},
    ${language},
    (select thingid from insert_method)
  ) RETURNING thingid
;
