INSERT into users (
  email,
  language,
  language_1,
  name
)
VALUES
  (
    ${userEmail},
    'en', 'en',
    ${userName}
  )
RETURNING id as user_id;
