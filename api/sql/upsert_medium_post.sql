INSERT INTO medium_posts(
    medium_id,
    title,
    author,
    url,
    imageUrl,
    description,
    created_at
  )
VALUES
  (
    ${id},
    ${title},
    ${author},
    ${url},
    ${imageUrl},
    ${description},
    ${createdAt}
  )
ON CONFLICT DO NOTHING;