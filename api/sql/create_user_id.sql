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
    'jon do'
  )
RETURNING id as user_id;

