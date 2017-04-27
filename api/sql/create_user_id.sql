INSERT into users (
  email,
  language,
  language_1,
  name,
  auth0_user_id,
  join_date,
  picture_url
)
VALUES
  (
    ${userEmail},
    'en', 'en',
    ${userName},
    ${auth0UserId},
    ${joinDate},
    ${pictureUrl}
  )
RETURNING id as user_id;
