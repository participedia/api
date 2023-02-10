UPDATE cases
SET
  hidden = ${hidden},
  published = ${published}
WHERE
  id = ${id}
;
UPDATE things
SET
  hidden = ${hidden},
  published = ${published}
WHERE
  id = ${id}
;