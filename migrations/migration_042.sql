-- create the new enum
DO $$ BEGIN
    CREATE TYPE completeness_enum as enum ('stub', 'partial_content', 'partial_citations', 'partial_editing', 'complete', '');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- alter table for cases
alter table cases
  add column IF NOT EXISTS completeness VARCHAR;
alter table cases
  alter column completeness type completeness_enum using completeness::text::completeness_enum;

-- alter table for methods
alter table methods
  add column IF NOT EXISTS completeness VARCHAR;
alter table methods
  alter column completeness type completeness_enum using completeness::text::completeness_enum;

  -- alter table for organization
alter table organizations
	add column IF NOT EXISTS completeness VARCHAR;
alter table organizations
 	alter column completeness type completeness_enum using completeness::text::completeness_enum;