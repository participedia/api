UPDATE users SET
  (
    name, bio
  )
=
  (
    ${name}, ${bio}
  )
  WHERE id = ${id}
  ;
