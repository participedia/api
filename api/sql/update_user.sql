UPDATE users SET 
  (
    name, picture_url, affiliation, title, bio, location  
  )
=
  (
    ${name}, ${picture_url}, ${affiliation}, ${title}, ${bio}, ${location:raw}
  ) WHERE id = ${id};
