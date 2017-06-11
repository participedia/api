CREATE TYPE object_title AS (
    id INTEGER,
    title TEXT
);

ALTER TABLE things
  ADD COLUMN url TEXT;
