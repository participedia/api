INSERT into users (
  email,
  language,
  language_1,
  name,
  auth0_user_id,
  join_date
)
VALUES
  (
    ${userEmail},
    'en', 'en',
    ${userName},
    ${auth0UserId},
    ${joinDate}
  )
RETURNING id as user_id;
