CREATE TYPE attachment AS (
	url text,
	title text,
	size integer
);


--
-- Name: author; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE author AS (
	user_id integer,
	"timestamp" timestamp without time zone,
	name text
);


--
-- Name: full_audio; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE full_audio AS (
	url text,
	attribution text,
	title text
);


--
-- Name: full_file; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE full_file AS (
	url text,
	source_url text,
	attribution text,
	title text
);


--
-- Name: full_link; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE full_link AS (
	url text,
	attribution text,
	title text
);


--
-- Name: full_object_title; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE full_object_title AS (
	id integer,
	type text,
	title text
);


--
-- Name: full_video; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE full_video AS (
	url text,
	attribution text,
	title text
);


--
-- Name: localized_value; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE localized_value AS (
	key text,
	lookup_key text,
	value text
);


--
-- Name: photo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE photo AS (
	url text,
	source_url text,
	attribution text,
	title text
);


--
-- Name: full_case; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE full_case AS (
	id integer,
	type text,
	title text,
	general_issues localized_value[],
	specific_topics localized_value[],
	brief_description text,
	body text,
	location_name text,
	address1 text,
	address2 text,
	city text,
	province text,
	postal_code text,
	country text,
	latitude text,
	longitude text,
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


--
-- Name: geolocation; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE geolocation AS (
	name text,
	address1 text,
	address2 text,
	city text,
	province text,
	country text,
	postal_code text,
	latitude text,
	longitude text
);


--
-- Name: object_medium; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE object_medium AS (
	id integer,
	title text,
	type text,
	images text[],
	post_date timestamp without time zone,
	updated_date timestamp without time zone,
	body text,
	bookmarked boolean,
	location geolocation
);


--
-- Name: object_short; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE object_short AS (
	id integer,
	title text,
	type text,
	images text[],
	post_date timestamp without time zone,
	updated_date timestamp without time zone
);


--
-- Name: object_title; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE object_title AS (
	id integer,
	title text
);

