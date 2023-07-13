--
-- Name: csv_export; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE csv_export (
    id SERIAL PRIMARY KEY,
    requested_timestamp timestamp,
    finished_timestamp timestamp,
    download_url text DEFAULT ''::text,
    type text NOT NULL
);