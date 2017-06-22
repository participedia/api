UPDATE users SET
  (
    name, picture_url, affiliation, title, bio, location, department, website, organization
  )
=
  (
    ${name}, ${picture_url}, ${affiliation}, ${title}, ${bio}, ${location:raw}, ${department}, ${website}, ${organization}
  ) WHERE id = ${id};
