WITH insert_organization as (
  INSERT into organizations (
    type, original_language, issue, post_date, published,
    updated_date, location, lead_image, other_images, files, videos,
    tags, featured, links
  )
  VALUES
    (
      'organization', ${language}, ${issue}, 'now', true,
      'now', ${location:raw},
      ${lead_image:raw}, '{}', '{}', ${videos:raw},
      '${tags:raw}', false, '${links:raw}'
    ) RETURNING id as thingid
),
insert_author as (
  INSERT into authors(user_id, timestamp, thingid)
  VALUES
    (${user_id}, 'now', (select thingid from insert_organization))
)

INSERT INTO localized_texts(body, title, language, thingid)
VALUES
  (
    ${body},
    ${title},
    ${language},
    (select thingid from insert_organization)
  ) RETURNING thingid
;
