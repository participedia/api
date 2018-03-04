--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.3
-- Dumped by pg_dump version 9.6.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

-- DROP DATABASE IF EXISTS participedia;
--
-- Name: participedia; Type: DATABASE; Schema: -; Owner: -
--

--CREATE DATABASE participedia WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';


--\connect participedia

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

--
-- Name: attachment; Type: TYPE; Schema: public; Owner: -
--

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
	"timestamp" timestamp,
	name text
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
	post_date timestamp,
	updated_date timestamp,
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
	post_date timestamp,
	updated_date timestamp
);


--
-- Name: object_title; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE object_title AS (
	id integer,
	title text
);




SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: authors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE authors (
    user_id integer NOT NULL,
    "timestamp" timestamp NOT NULL,
    thingid integer NOT NULL
);


--
-- Name: bookmarks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE bookmarks (
    id integer NOT NULL,
    bookmarktype character varying,
    thingid integer,
    userid integer
);


--
-- Name: bookmarks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE bookmarks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bookmarks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE bookmarks_id_seq OWNED BY bookmarks.id;


--
-- Name: things; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE things (
    id integer NOT NULL,
    type text NOT NULL,
    original_language text DEFAULT ''::text,
    post_date timestamp,
    published boolean,
    updated_date timestamp,
    location_name text DEFAULT ''::text,
    address1 text DEFAULT ''::text,
    address2 text DEFAULT ''::text,
    city text DEFAULT ''::text,
    province text DEFAULT ''::text,
    postal_code text DEFAULT ''::text,
    country text DEFAULT ''::text,
    latitude text DEFAULT ''::text,
    longitude text DEFAULT ''::text,
    files text[] DEFAULT '{}'::text[],
    tags text[] DEFAULT '{}'::text[],
    featured boolean DEFAULT false,
    links text[] DEFAULT '{}'::text[],
    hidden boolean DEFAULT false,
    videos text[] DEFAULT '{}'::text[],
    images text[] DEFAULT '{}'::text[]
);


--
-- Name: cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE cases (
    relationships text[] DEFAULT '{}'::text[],
    issues text[] DEFAULT '{}'::text[],
    specific_topics text[] DEFAULT '{}'::text[],
    is_component_of integer,
    scope_of_influence text DEFAULT ''::text,
    start_date timestamp,
    end_date timestamp,
    ongoing boolean,
    time_limited text DEFAULT ''::text,
    purposes text[] DEFAULT '{}'::text[],
    approaches text[] DEFAULT '{}'::text[],
    public_spectrum text DEFAULT ''::text,
    number_of_participants integer,
    open_limited text DEFAULT ''::text,
    recruitment_method text DEFAULT ''::text,
    targeted_participants text[] DEFAULT '{}'::text[],
    legality text DEFAULT ''::text,
    facilitators text DEFAULT ''::text,
    facilitator_training text DEFAULT ''::text,
    facetoface_online_or_both text DEFAULT ''::text,
    participants_interactions text[] DEFAULT '{}'::text[],
    learning_resources text[] DEFAULT '{}'::text[],
    decision_methods text[] DEFAULT '{}'::text[],
    if_voting text[] DEFAULT '{}'::text[],
    insights_outcomes text[] DEFAULT '{}'::text[],
    process_methods integer[] DEFAULT '{}'::integer[],
    primary_organizers integer[] DEFAULT '{}'::integer[],
    organizer_types text[] DEFAULT '{}'::text[],
    funder text DEFAULT ''::text,
    funder_types text[] DEFAULT '{}'::text[],
    staff boolean,
    volunteers boolean,
    impact_evidence text DEFAULT '',
    change_types text[] DEFAULT '{}'::text[],
    implementers_of_change text[] DEFAULT '{}'::text[],
    formal_evaluation text DEFAULT ''::text,
    evaluation_reports text[] DEFAULT '{}'::text[],
    evaluation_links text[] DEFAULT '{}'::text[]
)
INHERITS (things);


--
-- Name: localized_texts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE localized_texts (
    body text DEFAULT ''::text,
    title text NOT NULL,
    description text,
    language text DEFAULT 'en'::text,
    "timestamp" timestamp DEFAULT '2017-10-11 12:07:08.358366-07'::timestamp,
    thingid integer NOT NULL
);


--
-- Name: methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE methods (
    completeness text DEFAULT ''::text,
    facilitated boolean,
    geographical_scope text DEFAULT ''::text,
    participant_selections text[] DEFAULT '{}'::text[],
    recruitment_method text DEFAULT ''::text,
    communication_modes text[] DEFAULT '{}'::text[],
    decision_method text DEFAULT ''::text,
    if_voting text DEFAULT ''::text,
    public_interaction_methods text[] DEFAULT '{}'::text[],
    issue_polarization text DEFAULT ''::text,
    issue_technical_complexity text DEFAULT ''::text,
    issue_interdependency text DEFAULT ''::text
)
INHERITS (things);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE organizations (
    executive_director text DEFAULT ''::text,
    issues text DEFAULT '{}'::text[],
    sector text DEFAULT ''::text
)
INHERITS (things);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE users (
    id integer NOT NULL,
    hidden boolean,
    name text NOT NULL,
    email text NOT NULL,
    language text,
    language_1 text,
    accepted_date timestamp,
    last_access_date timestamp ,
    login timestamp,
    auth0_user_id text,
    join_date timestamp,
    picture_url text,
    bio text
);


--
-- Name: search_index_en; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

 CREATE MATERIALIZED VIEW search_index_en AS

 WITH allauthors AS (
   SELECT
     things.id thingid,
     string_agg(users.name, ' ') authorstring
   FROM users, authors, things
   WHERE
    authors.user_id = users.id AND
    authors.thingid = things.id
   GROUP BY things.id
), texts AS (
select distinct on(thingid) thingid, title, body, description
  from (
    select distinct on(thingid, timestamp) thingid, title, body, description
    from localized_texts
    where language = 'en'
    order by thingid, timestamp DESC
  ) as titles
  order by thingid
)

SELECT
		cases.id,
    cases.type,
    texts.title,
    texts.body,
    texts.description,
    setweight(to_tsvector('english'::regconfig, texts.title), 'A') ||
    setweight(to_tsvector('english'::regconfig, texts.body), 'D') ||
    setweight(to_tsvector('english'::regconfig, texts.description), 'C') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.tags, '{}'::text[]), ' ')), 'A') ||
    setweight(to_tsvector('english'::regconfig, allauthors.authorstring), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.city, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.country, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.relationships, '{}'::text[]), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.issues, '{}'::text[]), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.specific_topics, '{}'::text[]), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.scope_of_influence, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.time_limited, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.purposes, '{}'::text[]), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.approaches, '{}'::text[]), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.public_spectrum, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.open_limited, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.recruitment_method, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.targeted_participants, '{}'::text[]), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.legality, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.facilitators, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.facilitator_training, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.facetoface_online_or_both, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.participants_interactions, '{}'::text[]), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.learning_resources, '{}'::text[]), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.decision_methods, '{}'::text[]), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.if_voting, '{}'::text[]), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.insights_outcomes, '{}'::text[]), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.organizer_types, '{}'::text[]), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.funder, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.funder_types, '{}'::text[]), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.impact_evidence, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.change_types,  '{}'::text[]), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(cases.implementers_of_change, '{}'::text[]), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(cases.formal_evaluation, ''::text)), 'B')
    AS document
	FROM
		cases
  JOIN texts ON texts.thingid = cases.id
  JOIN allauthors ON allauthors.thingid = cases.id
	WHERE
    cases.hidden = false
UNION
SELECT
		methods.id,
    methods.type,
    texts.title,
    texts.body,
    texts.description,
    setweight(to_tsvector('english'::regconfig, texts.title), 'A') ||
    setweight(to_tsvector('english'::regconfig, texts.body), 'D') ||
    setweight(to_tsvector('english'::regconfig, texts.description), 'C') ||
    setweight(to_tsvector('english'::regconfig, allauthors.authorstring), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.geographical_scope, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(methods.participant_selections, '{}'::text[]), ' ')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.recruitment_method, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(methods.communication_modes, '{}'::text[]), ' ')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.decision_method, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.if_voting, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(methods.public_interaction_methods, '{}'::text[]), ' ')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.issue_polarization, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.issue_technical_complexity, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(methods.issue_interdependency, '')), 'B')
    AS document
	FROM
		methods
  JOIN texts ON texts.thingid = methods.id
  JOIN allauthors ON allauthors.thingid = methods.id
	WHERE
    methods.hidden = false
UNION
SELECT
		organizations.id,
    organizations.type,
    texts.title,
    texts.body,
    texts.description,
    setweight(to_tsvector('english'::regconfig, texts.title), 'A') ||
    setweight(to_tsvector('english'::regconfig, texts.body), 'D') ||
    setweight(to_tsvector('english'::regconfig, texts.description), 'C') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(COALESCE(organizations.tags, '{}'::text[]), ' ')), 'A') ||
    setweight(to_tsvector('english'::regconfig, allauthors.authorstring), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(organizations.city, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(organizations.country, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(organizations.executive_director, '')), 'A')
    AS document
	FROM
		organizations
  JOIN texts ON texts.thingid = organizations.id
  JOIN allauthors ON allauthors.thingid = organizations.id
	WHERE
    organizations.hidden = false
;

CREATE INDEX idx_fts_search_en ON search_index_en USING gin(document);


--
-- Name: things_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE things_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: things_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE things_id_seq OWNED BY things.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: bookmarks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY bookmarks ALTER COLUMN id SET DEFAULT nextval('bookmarks_id_seq'::regclass);


--
-- Name: cases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY cases ALTER COLUMN id SET DEFAULT nextval('things_id_seq'::regclass);


--
-- Name: cases original_language; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY cases ALTER COLUMN original_language SET DEFAULT ''::text;


--
-- Name: cases files; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY cases ALTER COLUMN files SET DEFAULT '{}'::attachment[];


--
-- Name: cases tags; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY cases ALTER COLUMN tags SET DEFAULT '{}'::text[];


--
-- Name: cases featured; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY cases ALTER COLUMN featured SET DEFAULT false;


--
-- Name: cases links; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY cases ALTER COLUMN links SET DEFAULT '{}'::text[];


--
-- Name: cases hidden; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY cases ALTER COLUMN hidden SET DEFAULT false;


--
-- Name: cases videos; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY cases ALTER COLUMN videos SET DEFAULT '{}'::text[];


--
-- Name: cases images; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY cases ALTER COLUMN images SET DEFAULT '{}'::text[];


--
-- Name: methods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY methods ALTER COLUMN id SET DEFAULT nextval('things_id_seq'::regclass);


--
-- Name: methods original_language; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY methods ALTER COLUMN original_language SET DEFAULT ''::text;


--
-- Name: methods files; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY methods ALTER COLUMN files SET DEFAULT '{}'::attachment[];


--
-- Name: methods tags; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY methods ALTER COLUMN tags SET DEFAULT '{}'::text[];


--
-- Name: methods featured; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY methods ALTER COLUMN featured SET DEFAULT false;


--
-- Name: methods links; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY methods ALTER COLUMN links SET DEFAULT '{}'::text[];


--
-- Name: methods hidden; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY methods ALTER COLUMN hidden SET DEFAULT false;


--
-- Name: methods videos; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY methods ALTER COLUMN videos SET DEFAULT '{}'::text[];


--
-- Name: methods images; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY methods ALTER COLUMN images SET DEFAULT '{}'::text[];


--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY organizations ALTER COLUMN id SET DEFAULT nextval('things_id_seq'::regclass);


--
-- Name: organizations original_language; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY organizations ALTER COLUMN original_language SET DEFAULT ''::text;


--
-- Name: organizations files; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY organizations ALTER COLUMN files SET DEFAULT '{}'::attachment[];


--
-- Name: organizations tags; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY organizations ALTER COLUMN tags SET DEFAULT '{}'::text[];


--
-- Name: organizations featured; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY organizations ALTER COLUMN featured SET DEFAULT false;


--
-- Name: organizations links; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY organizations ALTER COLUMN links SET DEFAULT '{}'::text[];


--
-- Name: organizations hidden; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY organizations ALTER COLUMN hidden SET DEFAULT false;


--
-- Name: organizations videos; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY organizations ALTER COLUMN videos SET DEFAULT '{}'::text[];


--
-- Name: organizations images; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY organizations ALTER COLUMN images SET DEFAULT '{}'::text[];


--
-- Name: things id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY things ALTER COLUMN id SET DEFAULT nextval('things_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);
