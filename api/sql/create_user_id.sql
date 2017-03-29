INSERT into users (
  email,
  name
)
VALUES
  (
    ${userEmail},
    'jon do'
  )
RETURNING id as user_id;

