/* Move authors and case__methods into object tables */

CREATE TYPE author AS (
    user_id INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE
);

ALTER TABLE cases
    ADD COLUMN authors author[],
    ADD COLUMN methods INTEGER[];

ALTER TABLE methods
    ADD COLUMN authors author[];

ALTER TABLE organizations
    ADD COLUMN authors author[];

UPDATE cases
    SET authors = auths.list
    FROM (
        SELECT array_agg(CAST(ROW(a.author, a.timestamp) AS author)) list, a.case_id
        FROM case__authors a
        GROUP BY a.case_id
    ) AS auths
    WHERE auths.case_id = cases.id;

UPDATE cases
    SET methods = meths.list
    FROM (
        SELECT array_agg(method_id) list, m.case_id
        FROM case__methods m
        GROUP BY m.case_id
    ) AS meths
    WHERE meths.case_id = cases.id;

UPDATE methods
    SET authors = auths.list
    FROM (
        SELECT array_agg(CAST(ROW(a.author, a.timestamp) AS author)) list, a.method_id
        FROM method__authors a
        GROUP BY a.method_id
    ) AS auths
    WHERE auths.method_id = methods.id;

UPDATE organizations
    SET authors = auths.list
    FROM (
        SELECT array_agg(CAST(ROW(a.author_id, a.timestamp) AS author)) list, a.organization_id
        FROM organization__authors a
        GROUP BY a.organization_id
    ) AS auths
    WHERE auths.organization_id = organizations.id;

DROP TABLE case__authors;
DROP TABLE case__methods;
DROP TABLE method__authors;
DROP TABLE organization__authors;
DROP TABLE organization__methods;
