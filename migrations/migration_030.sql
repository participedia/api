ALTER TABLE users
  ADD COLUMN department TEXT DEFAULT '',
  ADD COLUMN website TEXT DEFAULT '',
  ADD COLUMN organization INTEGER -- REFERENCES organizations(id
;
