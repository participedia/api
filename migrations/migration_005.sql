/* move tags and videos from separate tables into object tables */

CREATE TYPE video AS (
    url TEXT,
    title TEXT
);

ALTER TABLE cases
    ADD COLUMN videos video[],
    ADD COLUMN tags TEXT[];

ALTER TABLE methods
    ADD COLUMN videos video[],
    ADD COLUMN tags TEXT[];

ALTER TABLE organizations
    ADD COLUMN videos video[],
    ADD COLUMN tags TEXT[];

UPDATE cases
    SET videos = vids.list
    FROM (
        SELECT array_agg(CAST(ROW(v.url, v.title) AS video)) list, v.case_id
        FROM case__videos v
        GROUP BY v.case_id
    ) AS vids
    WHERE vids.case_id = cases.id;

UPDATE cases
    SET tags = t2.list
    FROM (
        SELECT array_agg(tag) list, t.case_id
        FROM case__tags t
        GROUP BY t.case_id
    ) AS t2
    WHERE t2.case_id = cases.id;

DROP TABLE case__videos;
DROP TABLE case__tags;

UPDATE methods
    SET videos = vids.list
    FROM (
        SELECT array_agg(CAST(ROW(v.url, v.title) AS video)) list, v.method_id
        FROM method__videos v
        GROUP BY v.method_id
    ) AS vids
    WHERE vids.method_id = methods.id;

UPDATE methods
    SET tags = t2.list
    FROM (
        SELECT array_agg(tag) list, t.method_id
        FROM method__tags t
        GROUP BY t.method_id
    ) AS t2
    WHERE t2.method_id = methods.id;

DROP TABLE method__videos;
DROP TABLE method__tags;

UPDATE organizations
    SET videos = vids.list
    FROM (
        SELECT array_agg(CAST(ROW(v.url, v.title) AS video)) list, v.organization_id
        FROM organization__videos v
        GROUP BY v.organization_id
    ) AS vids
    WHERE vids.organization_id = organizations.id;

UPDATE organizations
    SET tags = t2.list
    FROM (
        SELECT array_agg(tag) list, t.organization_id
        FROM organization__tags t
        GROUP BY t.organization_id
    ) AS t2
    WHERE t2.organization_id = organizations.id;

DROP TABLE organization__videos;
DROP TABLE organization__tags;
