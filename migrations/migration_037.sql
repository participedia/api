CREATE TABLE localizations (
  language text NOT NULL,
  keyvalues json NOT NULL
);

INSERT INTO localizations VALUES(
  'en',
  '{}'::json
);
