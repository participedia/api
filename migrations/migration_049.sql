CREATE TABLE collections (
  title text DEFAULT ''::text,
  description text,
  photos full_file[],
  bookmarked boolean
)
INHERITS (things);