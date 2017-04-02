ALTER TABLE case__methods RENAME TO case__related_methods;
ALTER TABLE organization__methods RENAME TO organization__related_methods;

ALTER TABLE case__related_methods
  RENAME COLUMN method_id TO related_method_id;

ALTER TABLE organization__related_methods
  RENAME COLUMN method_id TO related_method_id;

CREATE TABLE case__related_cases(
  related_case_id INTEGER REFERENCES cases(id),
  case_id INTEGER REFERENCES cases(id)
);

CREATE TABLE case__related_organizations(
  related_organization_id INTEGER REFERENCES organizations(id),
  case_id INTEGER REFERENCES cases(id)
);

CREATE TABLE method__related_cases(
  related_case_id INTEGER REFERENCES cases(id),
  method_id INTEGER REFERENCES methods(id)
);

CREATE TABLE method__related_methods(
  related_method_id INTEGER REFERENCES methods(id),
  method_id INTEGER REFERENCES methods(id)
);

CREATE TABLE method__related_organizations(
  related_organization_id INTEGER REFERENCES organizations(id),
  method_id INTEGER REFERENCES methods(id)
);

CREATE TABLE organization__related_cases(
  related_case_id INTEGER REFERENCES cases(id),
  organization_id INTEGER REFERENCES organizations(id)
);

CREATE TABLE organization__related_organizations(
  related_organization_id INTEGER REFERENCES organizations(id),
  organization_id INTEGER REFERENCES organizations(id)
);
