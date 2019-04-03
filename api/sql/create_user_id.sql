INSERT into users (
  email,
  language,
  language_1,
  name,
  auth0_user_id,
  join_date,
  bio
)
VALUES
  (
    ${userEmail},
    'en', 'en',
    ${userName},
    ${auth0UserId},
    ${joinDate},
    ${bio}
  )
RETURNING id as user_id;
