UPDATE users SET
  (
    name, picture_url, bio
  )
=
  (
    ${name}, ${picture_url}, ${bio}
  );
