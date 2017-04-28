INSERT into users (
  email,
  language,
  language_1,
  name,
  auth0_user_id,
  join_date,
  picture_url,
  title,
  affiliation,
  bio,
  location
)
VALUES
  (
    ${userEmail},
    'en', 'en',
    ${userName},
    ${auth0UserId},
    ${joinDate},
    ${pictureUrl},
    ${title},
    ${affiliation},
    ${bio},
    ${location}
  )
RETURNING id as user_id;
