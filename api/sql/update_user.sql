UPDATE users SET 
  (
    name, picture_url, affiliation, title, bio, location  
  )
VALUES
  (
    ${name}, ${picture_url}, ${affiliation}, ${title}, ${bio}, ${location}
  ) WHERE id = ${id};
