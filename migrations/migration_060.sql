DROP TABLE csv_export;

CREATE TABLE csv_export (
    id SERIAL PRIMARY KEY,
    csvId text DEFAULT ''::text,
    requested_timestamp timestamp,
    finished_timestamp timestamp,
    download_url text DEFAULT ''::text,
    type text NOT NULL,
    created_at timestamp,
    created_by text DEFAULT ''::text,
    updated_at timestamp,
    updated_by text DEFAULT ''::text,
    is_deleted boolean
);