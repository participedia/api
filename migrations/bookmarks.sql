CREATE TABLE case__bookmarks (
    id SERIAL PRIMARY KEY,
    owner INTEGER NOT NULL REFERENCES users,
    case_id INTEGER NOT NULL REFERENCES cases,
);

CREATE TABLE method__bookmarks (
    id INTEGER PRIMARY KEY SERIAL,
    owner INTEGER NOT NULL REFERENCES users,
    method_id INTEGER NOT NULL REFERENCES methods,
);

CREATE TABLE organization__bookmarks (
    id INTEGER PRIMARY KEY SERIAL,
    owner INTEGER NOT NULL REFERENCES users,
    organization_id INTEGER NOT NULL REFERENCES organizations,
);
