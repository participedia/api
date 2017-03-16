/* Prepare to return authors as correct structure */

CREATE TYPE author AS (
    user_id INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE,
    name TEXT
);
