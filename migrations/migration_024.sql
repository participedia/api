CREATE TABLE things (
    id SERIAL PRIMARY KEY,
    original_language text DEFAULT ''::text,
    post_date TIMESTAMPTZ,
    published BOOLEAN,
    updated_date TIMESTAMPTZ,
    location geolocation DEFAULT '("","","","","","","","","")'::geolocation,
    lead_image attachment DEFAULT '("","",0)'::attachment,
    other_images attachment[] DEFAULT '{}'::attachment[],
    files attachment[] DEFAULT '{}'::attachment[],
    videos video[] DEFAULT '{}'::video[],
    tags text[] DEFAULT '{}'::text[],
    featured BOOLEAN DEFAULT false
);


CREATE TABLE casethings (
    issue TEXT DEFAULT ''::text,
    communication_mode TEXT DEFAULT ''::text,
    communication_with_audience TEXT DEFAULT ''::text,
    content_country TEXT DEFAULT ''::text,
    decision_method TEXT DEFAULT ''::text,
    end_date TIMESTAMPTZ,
    facetoface_online_or_both virtualness,
    facilitated TEXT DEFAULT ''::text,
    voting voting_type,
    number_of_meeting_days INTEGER,
    ongoing BOOLEAN,
    start_date TIMESTAMPTZ,
    total_number_of_participants INTEGER,
    targeted_participant_demographic TEXT DEFAULT ''::text,
    kind_of_influence TEXT DEFAULT ''::text,
    targeted_participants_public_role TEXT DEFAULT ''::text,
    targeted_audience TEXT DEFAULT ''::text,
    participant_selection TEXT DEFAULT ''::text,
    specific_topic TEXT DEFAULT ''::text,
    staff_type TEXT DEFAULT ''::text,
    type_of_funding_entity TEXT DEFAULT ''::text,
    typical_implementing_entity TEXT DEFAULT ''::text,
    typical_sponsoring_entity TEXT DEFAULT ''::text,
    who_else_supported_the_initiative TEXT DEFAULT ''::text,
    who_was_primarily_responsible_for_organizing_the_initiative INTEGER
) INHERITS (things);

CREATE TABLE methodthings (
    best_for TEXT DEFAULT ''::text,
    communication_mode TEXT DEFAULT ''::text,
    decision_method TEXT DEFAULT ''::text,
    facilitated BOOLEAN,
    governance_contribution TEXT DEFAULT ''::text,
    issue_interdependency TEXT DEFAULT ''::text,
    issue_polarization TEXT DEFAULT ''::text,
    issue_technical_complexity TEXT DEFAULT ''::text,
    kind_of_influence TEXT DEFAULT ''::text,
    method_of_interaction TEXT DEFAULT ''::text,
    public_interaction_method TEXT DEFAULT ''::text,
    typical_funding_source TEXT DEFAULT ''::text,
    typical_implementing_entity TEXT DEFAULT ''::text,
    typical_sponsoring_entity TEXT DEFAULT ''::text
) INHERITS (things);

CREATE TABLE organizationthings (
    executive_director TEXT DEFAULT ''::text,
    issue TEXT DEFAULT ''::text,
    sector TEXT DEFAULT ''::text
) INHERITS (things);


INSERT INTO casethings (id, original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, issue, communication_mode, communication_with_audience, content_country, decision_method, end_date, facetoface_online_or_both, facilitated, voting, number_of_meeting_days, ongoing, start_date, total_number_of_participants, targeted_participant_demographic, kind_of_influence, targeted_participants_public_role, targeted_audience, participant_selection, specific_topic, staff_type, type_of_funding_entity, typical_implementing_entity, typical_sponsoring_entity, who_else_supported_the_initiative, who_was_primarily_responsible_for_organizing_the_initiative
) SELECT id, original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, issue, communication_mode, communication_with_audience, content_country, decision_method, end_date, facetoface_online_or_both, facilitated, voting, number_of_meeting_days, ongoing, start_date, total_number_of_participants, targeted_participant_demographic, kind_of_influence, targeted_participants_public_role, targeted_audience, participant_selection, specific_topic, staff_type, type_of_funding_entity, typical_implementing_entity, typical_sponsoring_entity, who_else_supported_the_initiative, who_was_primarily_responsible_for_organizing_the_initiative from cases;

INSERT INTO methodthings (id, original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, best_for, communication_mode, decision_method, facilitated, governance_contribution, issue_interdependency, issue_polarization, issue_technical_complexity, kind_of_influence, method_of_interaction, public_interaction_method, typical_funding_source, typical_implementing_entity, typical_sponsoring_entity
) SELECT id, original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, best_for, communication_mode, decision_method, facilitated, governance_contribution, issue_interdependency, issue_polarization, issue_technical_complexity, kind_of_influence, method_of_interaction, public_interaction_method, typical_funding_source, typical_implementing_entity, typical_sponsoring_entity from methods;

INSERT INTO organizationthings (id, original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, executive_director, issue, sector
) SELECT id, original_language, post_date, published, updated_date, location, lead_image, other_images, files, videos, tags, featured, executive_director, issue, sector from organizations;

CREATE TABLE authors (
  user_id INTEGER REFERENCES users (id),
  timestamp TIMESTAMPTZ NOT NULL,
  thingid INTEGER -- REFERENCES things (id) -- Refererence constraints do not work with table inheritance
);

INSERT INTO authors SELECT * from case__authors;
INSERT INTO authors SELECT * from method__authors;
INSERT INTO authors SELECT * from organization__authors;

DROP TABLE case__authors;
DROP TABLE method__authors;
DROP TABLE organization__authors;
