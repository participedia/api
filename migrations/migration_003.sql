/* Accept the tools that Postgresql gives us have a reason for existing. Instead
of splitting out bits that are logically part of the object record (like location, tags, etc.) and
which don't require complex queries on their own, use arrays and complex types to
capture those within the object table itself. */


CREATE TYPE geolocation AS (
    name TEXT,
    address1 TEXT,
    address2 TEXT,
    city TEXT,
    province TEXT,
    country TEXT,
    postal_code TEXT,
    latitude TEXT, /* lat/long should probably be a PostGIS geography point in one column */
    longitude TEXT
);

ALTER TABLE cases ADD COLUMN location geolocation;
UPDATE cases SET location = (l.location_name, l.address1, l.address2, l.city, l.province, l.country, l.postal_code, l.latitude, l.longitude) FROM case__locations l where l.case_id = cases.id;
DROP TABLE case__locations;

ALTER TABLE organizations ADD COLUMN location geolocation;
UPDATE organizations SET location = (l.location_name, l.address1, l.address2, l.city, l.province, l.country, l.postal_code, l.latitude, l.longitude) FROM organization__locations l where l.organization_id = organizations.id;
DROP TABLE organization__locations;
