---
--- Name: get_completeness_case(id); Type: FUNCTION: Schema: public; Owner: -
---

CREATE OR REPLACE FUNCTION get_completeness_case(id integer) RETURNS completeness_enum
  LANGUAGE sql STABLE
  AS $_$
  SELECT
    completeness
  FROM
    cases
  WHERE
    id = $1
$_$;

---
--- Name: get_completeness_methods(id); Type: FUNCTION: Schema: public; Owner: -
---

CREATE OR REPLACE FUNCTION get_completeness_methods(id integer) RETURNS completeness_enum
  LANGUAGE sql STABLE
  AS $_$
  SELECT
    completeness
  FROM
    methods
  WHERE
    id = $1
$_$;

---
--- Name: get_completeness_organizations(id); Type: FUNCTION: Schema: public; Owner: -
---

CREATE OR REPLACE FUNCTION get_completeness_organizations(id integer) RETURNS completeness_enum
  LANGUAGE sql STABLE
  AS $_$
  SELECT
    completeness
  FROM
    organizations
  WHERE
    id = $1
$_$;