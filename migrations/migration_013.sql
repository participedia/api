CREATE TYPE object_reference AS (
    id INTEGER,
    type TEXT,
    title TEXT,
    lead_image TEXT
);
-- Insert some test data for related cases
INSERT INTO case__related_cases VALUES (45, 37);
INSERT INTO case__related_cases VALUES (63, 37);
INSERT INTO case__related_cases VALUES (70, 38);
INSERT INTO case__related_methods VALUES (145, 37);
INSERT INTO case__related_methods VALUES (163, 37);
INSERT INTO case__related_methods VALUES (170, 38);
INSERT INTO case__related_organizations VALUES (245, 37);
INSERT INTO case__related_organizations VALUES (263, 37);
INSERT INTO case__related_organizations VALUES (270, 38);

INSERT INTO method__related_cases VALUES (52, 161);
INSERT INTO method__related_cases VALUES (47, 161);
INSERT INTO method__related_cases VALUES (65, 162);
INSERT INTO method__related_methods VALUES (152, 161);
INSERT INTO method__related_methods VALUES (147, 161);
INSERT INTO method__related_methods VALUES (165, 162);
INSERT INTO method__related_organizations VALUES (252, 161);
INSERT INTO method__related_organizations VALUES (247, 161);
INSERT INTO method__related_organizations VALUES (265, 162);

INSERT INTO organization__related_cases VALUES (47, 270);
INSERT INTO organization__related_cases VALUES (55, 270);
INSERT INTO organization__related_cases VALUES (66, 269);
INSERT INTO organization__related_methods VALUES (147, 270);
INSERT INTO organization__related_methods VALUES (155, 270);
INSERT INTO organization__related_methods VALUES (166, 269);
INSERT INTO organization__related_organizations VALUES (247, 270);
INSERT INTO organization__related_organizations VALUES (255, 270);
INSERT INTO organization__related_organizations VALUES (266, 269);
;
