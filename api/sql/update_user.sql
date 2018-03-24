UPDATE users SET
  (
    name, picture_url, bio
  )
=
  (
    ${name}, ${picture_url}, ${bio}
  )
  WHERE users.id = ${id}
  ;
