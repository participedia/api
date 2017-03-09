/* Move locations from one general table to a table per object type like other
   object properties. Reference them by object_id rather than by location_id */

CREATE TABLE organization__locations (
    location_name TEXT,
    address1 TEXT,
    address2 TEXT,
    city TEXT,
    province TEXT,
    country TEXT,
    postal_code TEXT,
    latitude TEXT, /* lat/long should probably be a PostGIS geography point in one column */
    longitude TEXT,
    organization_id INTEGER REFERENCES organizations(id)
);

CREATE TABLE case__locations (
    location_name TEXT,
    address1 TEXT,
    address2 TEXT,
    city TEXT,
    province TEXT,
    country TEXT,
    postal_code TEXT,
    latitude TEXT, /* lat/long should probably be a PostGIS geography point in one column */
    longitude TEXT,
    case_id INTEGER REFERENCES cases(id)
);

INSERT INTO organization__locations (location_name, address1, address2, city, province, country, postal_code, latitude, longitude, organization_id) SELECT geolocation.name, geolocation.address1, geolocation.address2, geolocation.city, geolocation.province, geolocation.country, geolocation.postal_code, geolocation.latitude, geolocation.longitude, organizations.id from geolocation, organizations where organizations.location = geolocation.id;

INSERT INTO case__locations (location_name, address1, address2, city, province, country, postal_code, latitude, longitude, case_id) SELECT geolocation.name, geolocation.address1, geolocation.address2, geolocation.city, geolocation.province, geolocation.country, geolocation.postal_code, geolocation.latitude, geolocation.longitude, cases.id from geolocation, cases where cases.location = geolocation.id;

ALTER TABLE organizations DROP COLUMN location;
ALTER TABLE cases DROP COLUMN location;

DROP TABLE geolocation;
