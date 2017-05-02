/* ENUMS */

CREATE TYPE virtualness as ENUM ('facetoface', 'online', 'both');
-- CREATE TYPE geo_scope as ENUM ('international', 'local', 'national', 'regional');
CREATE TYPE voting_type as ENUM ('none', 'consensus', 'supermajority', 'majority', 'preferential');
CREATE TYPE filetype as ENUM ('file', 'image');

/* GEOLOCATION */

CREATE TABLE geolocation (
    id SERIAL PRIMARY KEY,
    name TEXT,
    address1 TEXT,
    address2 TEXT,
    city TEXT,
    province TEXT,
    country TEXT,
    postal_code TEXT,
    latitude TEXT, /* lat/long should probably be a PostGIS geography point in one column */
    longitude TEXT
);

/* USERS */

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    language TEXT,
    language_1 TEXT,
    accepted_date TIMESTAMP WITH TIME ZONE,
    last_access_date TIMESTAMP WITH TIME ZONE,
    login TIMESTAMP WITH TIME ZONE
);

/* METHODS */

CREATE TABLE methods (
    id SERIAL PRIMARY KEY,
    original_language TEXT, /* two-letter IANA language subtag */
    best_for TEXT,
    communication_mode TEXT,
    decision_method TEXT,
    facilitated BOOLEAN,
    governance_contribution TEXT,
    issue_interdependency TEXT,
    issue_polarization TEXT,
    issue_technical_complexity TEXT,
    kind_of_influence TEXT,
    method_of_interaction TEXT,
    public_interaction_method TEXT,
    post_date TIMESTAMP WITH TIME ZONE,
    published boolean NOT NULL,
    typical_funding_source TEXT,
    typical_implementing_entity TEXT,
    typical_sponsoring_entity TEXT,
    updated_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE method__localized_texts (
    body TEXT,
    title TEXT NOT NULL,
    language TEXT NOT NULL, /* two-letter IANA language subtag */
    method_id INTEGER REFERENCES methods(id),
    CONSTRAINT method_id_langugage PRIMARY KEY(method_id, language)
);

/* Keep track of each day and time someone edits */
CREATE TABLE method__authors (
    user_id INTEGER REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    method_id INTEGER REFERENCES methods(id)
);

CREATE TABLE method__attachments (
    url TEXT NOT NULL,
    title TEXT,
    type filetype NOT NULL,
    size INTEGER,
    is_lead BOOLEAN,
    method_id INTEGER REFERENCES methods(id)
);

CREATE TABLE method__tags (
    tag TEXT NOT NULL,
    method_id INTEGER REFERENCES methods(id)
);

CREATE TABLE method__videos (
    url TEXT NOT NULL,
    title TEXT,
    method_id INTEGER REFERENCES methods(id)
);

/* Organizations */

CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    original_language TEXT, /* two-letter IANA language subtag */
    executive_director TEXT,
    issue TEXT,
    location INTEGER REFERENCES geolocation(id),
    post_date TIMESTAMP WITH TIME ZONE,
    published boolean,
    sector TEXT,
    updated_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE organization__localized_texts (
    body TEXT,
    title TEXT NOT NULL,
    language TEXT NOT NULL, /* two-letter IANA language subtag */
    organization_id INTEGER REFERENCES organizations(id),
    CONSTRAINT organization_id_language PRIMARY KEY(organization_id, language)
);

/* Keep track of each day and time someone edits */
CREATE TABLE organization__authors (
    user_id INTEGER REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    organization_id INTEGER REFERENCES organizations(id)
);

CREATE TABLE organization__attachments (
    url TEXT NOT NULL,
    title TEXT,
    type filetype NOT NULL,
    size INTEGER,
    is_lead BOOLEAN,
    organization_id INTEGER REFERENCES organizations(id)
);

CREATE TABLE organization__methods (
    method_id INTEGER REFERENCES methods(id),
    organization_id INTEGER REFERENCES organizations(id)
);

CREATE TABLE organization__tags (
    tag TEXT NOT NULL,
    organization_id INTEGER REFERENCES organizations(id)
);

CREATE TABLE organization__videos (
    url TEXT NOT NULL,
    title TEXT,
    organization_id INTEGER REFERENCES organizations(id)
);

CREATE TABLE cases (
    id SERIAL PRIMARY KEY,
    original_language TEXT, /* two-letter IANA language subtag */
    issue TEXT,
    communication_mode TEXT,
    communication_with_audience TEXT,
    content_country TEXT,
    decision_method TEXT,
    end_date TIMESTAMP WITH TIME ZONE,
    facetoface_online_or_both VIRTUALNESS,
    facilitated TEXT,
    location INTEGER REFERENCES geolocation(id),
    voting VOTING_TYPE,
    number_of_meeting_days INTEGER,
    ongoing BOOLEAN,
    post_date TIMESTAMP WITH TIME ZONE,
    published BOOLEAN,
    start_date TIMESTAMP WITH TIME ZONE,
    total_number_of_participants INTEGER,
    updated_date TIMESTAMP WITH TIME ZONE,
    targeted_participant_demographic TEXT,
    kind_of_influence TEXT,
    targeted_participants_public_role TEXT,
    targeted_audience TEXT,
    participant_selection TEXT,
    specific_topic TEXT,
    staff_type TEXT,
    type_of_funding_entity TEXT,
    typical_implementing_entity TEXT,
    typical_sponsoring_entity TEXT,
    who_else_supported_the_initiative TEXT,
    who_was_primarily_responsible_for_organizing_the_initiative INTEGER REFERENCES organizations(id)
);

CREATE TABLE case__localized_texts (
    body TEXT NOT NULL,
    title TEXT NOT NULL,
    language TEXT NOT NULL, /* two-letter IANA language subtag */
    case_id INTEGER REFERENCES cases(id),
    CONSTRAINT case_id_language PRIMARY KEY(case_id, language)
);

/* all methods referenced by a case */
CREATE TABLE case__methods (
    method_id INTEGER REFERENCES methods(id),
    case_id INTEGER REFERENCES cases(id)
);

/* Keep track of each day and time someone edits */
CREATE TABLE case__authors (
    user_id INTEGER REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    case_id INTEGER REFERENCES cases(id)
);

CREATE TABLE case__attachments (
    url TEXT NOT NULL,
    title TEXT,
    type filetype NOT NULL,
    size INTEGER,
    is_lead BOOLEAN,
    case_id INTEGER REFERENCES cases(id)
);

CREATE TABLE case__tags (
    tag TEXT NOT NULL,
    case_id INTEGER REFERENCES cases(id)
);

CREATE TABLE case__videos (
    url TEXT NOT NULL,
    title TEXT,
    case_id INTEGER REFERENCES cases(id)
);

CREATE TABLE bookmarks (
  ID SERIAL PRIMARY KEY,
  bookmarktype VARCHAR,
  thingid INTEGER,
  userid INTEGER REFERENCES users(id)
);


-- import all the things!
-- this is generated from json_stats.py as copy_commands.sql

\COPY geolocation (address1,address2,city,country,id,latitude,longitude,name,postal_code,province) FROM 'migrations/geolocation.csv' WITH CSV HEADER
\COPY users (accepted_date, email, id, language, language_1, last_access_date, login, name) FROM 'migrations/users.csv' WITH CSV HEADER
\COPY methods (best_for,communication_mode,decision_method,facilitated,governance_contribution,id,issue_interdependency,issue_polarization,issue_technical_complexity,kind_of_influence,method_of_interaction,original_language,post_date,public_interaction_method,published,typical_funding_source,typical_sponsoring_entity,updated_date) FROM 'migrations/methods.csv' WITH CSV HEADER
\COPY method__localized_texts (body,language,method_id,title) FROM 'migrations/method__localized_texts.csv' WITH CSV HEADER
\COPY method__authors (user_id,method_id,timestamp) FROM 'migrations/method__authors.csv' WITH CSV HEADER
\COPY method__attachments (is_lead,method_id,size,title,type,url) FROM 'migrations/method__attachments.csv' WITH CSV HEADER
\COPY method__tags (method_id,tag) FROM 'migrations/method__tags.csv' WITH CSV HEADER
\COPY method__videos (method_id,title,url) FROM 'migrations/method__videos.csv' WITH CSV HEADER
\COPY organizations (executive_director,id,issue,location,original_language,post_date,published,sector,updated_date) FROM 'migrations/organizations.csv' WITH CSV HEADER
\COPY organization__localized_texts (body,language,organization_id,title) FROM 'migrations/organization__localized_texts.csv' WITH CSV HEADER
\COPY organization__authors (user_id,organization_id,timestamp) FROM 'migrations/organization__authors.csv' WITH CSV HEADER
\COPY organization__attachments (is_lead,organization_id,size,title,type,url) FROM 'migrations/organization__attachments.csv' WITH CSV HEADER
\COPY organization__tags (organization_id,tag) FROM 'migrations/organization__tags.csv' WITH CSV HEADER
\COPY organization__videos (organization_id,title,url) FROM 'migrations/organization__videos.csv' WITH CSV HEADER
\COPY cases (communication_mode,communication_with_audience,content_country,decision_method,end_date,facetoface_online_or_both,facilitated,id,issue,kind_of_influence,location,number_of_meeting_days,ongoing,original_language,participant_selection,post_date,published,specific_topic,staff_type,start_date,targeted_audience,targeted_participant_demographic,targeted_participants_public_role,total_number_of_participants,type_of_funding_entity,typical_implementing_entity,typical_sponsoring_entity,updated_date,voting,who_else_supported_the_initiative,who_was_primarily_responsible_for_organizing_the_initiative) FROM 'migrations/cases.csv' WITH CSV HEADER
\COPY case__localized_texts (body,case_id,language,title) FROM 'migrations/case__localized_texts.csv' WITH CSV HEADER
\COPY case__authors (user_id,case_id,timestamp) FROM 'migrations/case__authors.csv' WITH CSV HEADER
\COPY case__attachments (case_id,is_lead,size,title,type,url) FROM 'migrations/case__attachments.csv' WITH CSV HEADER
\COPY case__tags (case_id,tag) FROM 'migrations/case__tags.csv' WITH CSV HEADER
\COPY case__videos (case_id,title,url) FROM 'migrations/case__videos.csv' WITH CSV HEADER

\include 'migrations/migration_002.sql'
\include 'migrations/migration_003.sql'
\include 'migrations/migration_004.sql'
\include 'migrations/migration_005.sql'
\include 'migrations/migration_006.sql'
\include 'migrations/migration_007.sql'
\include 'migrations/migration_008.sql'
\include 'migrations/migration_009.sql'
\include 'migrations/migration_010.sql'
\include 'migrations/migration_011.sql'
\include 'migrations/migration_012.sql'
\include 'migrations/migration_013.sql'
-- migration_014.sql intentionally left blank
\include 'migrations/migration_015.sql'
\include 'migrations/migration_016.sql'
\include 'migrations/migration_017.sql'
\include 'migrations/migration_018.sql'
\include 'migrations/migration_019.sql'
\include 'migrations/migration_020.sql'
\include 'migrations/migration_021.sql'
