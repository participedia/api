DROP TYPE object_reference;
CREATE TYPE object_reference AS (
    id INTEGER,
    type TEXT,
    title TEXT,
    lead_image TEXT,
    updated_date timestamp with time zone,
    post_date timestamp with time zone
);
