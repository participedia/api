--
-- Name: object_title; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE user_name AS (
	id integer,
	name text
);

CREATE OR REPLACE FUNCTION get_user_names(userid integer) RETURNS user_name[]
  LANGUAGE sql STABLE
  AS $_$
  SELECT
    CASE
      WHEN (select isadmin from users where id = userid) THEN
        array_agg((id, name)::user_name)
      ELSE
        '{}'
      END
    FROM users;
$_$;
