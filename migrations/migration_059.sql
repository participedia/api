DROP FUNCTION get_object_short(integer, text);
DROP TYPE object_short;

CREATE TYPE object_short AS (
	id integer,
	title text,
	type text,
	published boolean,
	photos full_file[],
	post_date timestamp,
	updated_date timestamp,
  bookmarked boolean
);
