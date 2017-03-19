/* Prepare to return authors as correct structure */

CREATE TYPE author AS (
    user_id INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE,
    name TEXT
);

/* Add support for "featured" flag */


ALTER TABLE cases
    ADD COLUMN featured BOOLEAN DEFAULT false;

ALTER TABLE methods
    ADD COLUMN featured BOOLEAN DEFAULT false;

ALTER TABLE organizations
    ADD COLUMN featured BOOLEAN DEFAULT false;
