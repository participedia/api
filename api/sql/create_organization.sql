WITH insert_organization as (
  INSERT into organizations (
    original_language, executive_director, issue,
    post_date, published,
    sector, updated_date, location,
    lead_image, other_images,
    files, videos, tags, featured
  )
  VALUES
    (
      ${language}, null, null, 'now', true, null, 'now', ${location:raw},
      ${lead_image:raw},
      '{}', '{}', ${videos:raw}, '{}', false
    ) RETURNING id as organization_id
),
insert_author as (
  INSERT into authors(user_id, timestamp, thingid)
  VALUES
    (${user_id}, 'now', (select organization_id from insert_organization))
)

INSERT INTO organization__localized_texts(body, title, language, organization_id)
VALUES
  (
    ${body},
    ${title},
    ${language},
    (select organization_id from insert_organization)
  ) RETURNING organization_id
;
