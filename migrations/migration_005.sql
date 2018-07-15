--
-- Name: bookmarks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE ui (
    id INTEGER NOT NULL, -- may not be needed
    language text NOT NULL,
    page text NOT NULL,
    value jsonb NOT NULL
);
