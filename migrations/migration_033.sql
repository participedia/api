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

DROP TYPE full_case CASCADE;
-- The cascade will also delete get_case_by_id(integer,text,integer,json),
-- which should have been deleted in migration 27 and has been replaced
-- by api/sql/case_view_by_id.sql

CREATE TYPE full_case AS (
 	id integer,
 	type text,
 	title text,
 	general_issues localized_value[],
 	specific_topics localized_value[],
 	brief_description text,
 	body text,
 	tags localized_value[],
 	location_name text,
 	address1 text,
 	address2 text,
 	city text,
 	province text,
 	postal_code text,
 	country text,
 	latitude float,
 	longitude float,
 	scope_of_influence localized_value,
 	has_components full_object_title[],
 	is_component_of full_object_title,
 	files full_file[],
 	links full_link[],
 	photos photo[],
 	videos full_video[],
 	audio full_audio[],
 	start_date timestamp without time zone,
 	end_date timestamp without time zone,
 	ongoing boolean,
 	time_limited localized_value,
 	purpose localized_value[],
 	approach localized_value[],
 	public_spectrum localized_value,
 	number_of_participants integer,
 	open_limited localized_value,
 	recruitment_method localized_value,
 	targeted_participants localized_value[],
 	method_types localized_value[],
 	tools_techniques_types localized_value[],
 	specific_methods_tools_techniques full_object_title[],
 	legality localized_value,
 	facilitators localized_value,
 	facilitator_training localized_value,
 	facetoface_online_or_both localized_value,
 	participants_interaction localized_value[],
 	learning_resources localized_value[],
 	decision_methods localized_value[],
 	if_voting localized_value[],
 	insights_outcomes localized_value[],
 	primary_organizer full_object_title,
 	organizer_types localized_value[],
 	funder text,
 	funder_types localized_value[],
 	staff boolean,
 	volunteers boolean,
 	impact_evidence text,
 	change_types localized_value[],
 	implementers_of_change localized_value[],
 	formal_evaluation text,
 	evaluation_reports text[],
 	evaluation_links text[],
 	bookmarked boolean,
 	creator author,
 	last_updated_by author,
 	original_language text,
 	post_date timestamp without time zone,
 	published boolean,
 	updated_date timestamp without time zone,
 	featured boolean,
 	hidden boolean
 );

DROP TYPE geolocation CASCADE;
-- The cascade will also delete type object_medium (currently unused)
-- and function get_location(integer) which we will redefine below
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
