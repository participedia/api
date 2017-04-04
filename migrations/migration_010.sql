ALTER TABLE case__methods RENAME TO case__related_methods;
ALTER TABLE organization__methods RENAME TO organization__related_methods;

ALTER TABLE case__related_methods
  RENAME COLUMN method_id TO related_method_id;

ALTER TABLE case__related_methods
  ADD CONSTRAINT case_meth UNIQUE(case_id, related_method_id);

ALTER TABLE organization__related_methods
  RENAME COLUMN method_id TO related_method_id;

ALTER TABLE organization__related_methods
  ADD CONSTRAINT org_meth UNIQUE(organization_id, related_method_id);

CREATE TABLE case__related_cases(
  related_case_id INTEGER REFERENCES cases(id),
  case_id INTEGER REFERENCES cases(id),
  CONSTRAINT case_case UNIQUE(case_id, related_case_id)
);

CREATE TABLE case__related_organizations(
  related_organization_id INTEGER REFERENCES organizations(id),
  case_id INTEGER REFERENCES cases(id),
  CONSTRAINT case_org UNIQUE(case_id, related_organization_id)
);

CREATE TABLE method__related_cases(
  related_case_id INTEGER REFERENCES cases(id),
  method_id INTEGER REFERENCES methods(id),
  CONSTRAINT meth_case UNIQUE(method_id, related_case_id)
);

CREATE TABLE method__related_methods(
  related_method_id INTEGER REFERENCES methods(id),
  method_id INTEGER REFERENCES methods(id),
  CONSTRAINT meth_meth UNIQUE(method_id, related_method_id)
);

CREATE TABLE method__related_organizations(
  related_organization_id INTEGER REFERENCES organizations(id),
  method_id INTEGER REFERENCES methods(id),
  CONSTRAINT meth_org UNIQUE(method_id, related_organization_id)
);

CREATE TABLE organization__related_cases(
  related_case_id INTEGER REFERENCES cases(id),
  organization_id INTEGER REFERENCES organizations(id),
  CONSTRAINT org_case UNIQUE(organization_id, related_case_id)
);

CREATE TABLE organization__related_organizations(
  related_organization_id INTEGER REFERENCES organizations(id),
  organization_id INTEGER REFERENCES organizations(id),
  CONSTRAINT org_org UNIQUE(organization_id, related_organization_id)
);
