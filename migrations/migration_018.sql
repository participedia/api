DROP TYPE object_reference;
CREATE TYPE object_reference AS (
    id INTEGER,
    type TEXT,
    title TEXT,
    lead_image attachment,
    updated_date timestamptz,
    post_date timestamptz
);
