ALTER TABLE methods ADD COLUMN collections text[] DEFAULT '{}'::text[];
ALTER TABLE organizations ADD COLUMN collections text[] DEFAULT '{}'::text[];