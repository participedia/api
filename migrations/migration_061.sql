DROP TABLE IF EXISTS medium_posts;

CREATE TABLE medium_posts (
    id SERIAL PRIMARY KEY,
    medium_id text UNIQUE DEFAULT ''::text,
    title text DEFAULT ''::text,
    author text DEFAULT ''::text,
    url text DEFAULT ''::text,
    imageUrl text DEFAULT ''::text,
    description text DEFAULT ''::text,
    created_at bigint
);