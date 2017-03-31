INSERT into users (
  email,
  language,
  language_1,
  name,
  auth0_user_id
)
VALUES
  (
    ${userEmail},
    'en', 'en',
    ${userName},
    ${auth0UserId}
  )
RETURNING id as user_id;
