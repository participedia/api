 -- migrate latitude, longitude to be floats instead of strings

ALTER TABLE things ADD COLUMN lat float DEFAULT null;
ALTER TABLE things ADD COLUMN long float DEFAULT null;

CREATE OR REPLACE FUNCTION DMStoFloat(dms text) RETURNS float
    LANGUAGE plpgSQL STABLE
    AS $_$
    declare
      result float := 0.0;
    begin
		select r[1]::integer + (r[2]::integer / 60.0) + (r[3]::float / (60.0 * 60.0))
		into result
		from regexp_matches(dms, '''*(\d+)° (\d+)''''* ([\d\.]+)\" ([NSEW])''*') as r;
		if right(dms, 1) = 'W' or right(dms, 1) = 'S' then
		  return result * -1;
		 else
		   return result;
		 end if;
	end;
$_$;

UPDATE things
  SET lat = DMStoFloat(latitude),
      long = DMStoFloat(longitude)
  WHERE latitude != '0° 0'' 0" N' AND latitude != '';

ALTER TABLE things DROP COLUMN latitude;
ALTER TABLE things DROP COLUMN longitude;

ALTER TABLE things RENAME COLUMN lat TO latitude;
ALTER TABLE things RENAME COLUMN long TO longitude;

DROP TYPE object_medium; -- unused
DROP FUNCTION get_location(integer); -- replaced
DROP TYPE geolocation;
CREATE TYPE geolocation AS (
	name text,
	address1 text,
	address2 text,
	city text,
	province text,
	country text,
	postal_code text,
	latitude float,
	longitude float
);

CREATE OR REPLACE FUNCTION get_location(id integer) RETURNS geolocation
  LANGUAGE sql STABLE
  AS $_$
SELECT
  ROW(location_name, address1, address2, city, province, postal_code, country, latitude, longitude)::geolocation
FROM
  things
WHERE
  things.id = $1
$_$;
