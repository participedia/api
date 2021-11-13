ALTER TABLE methods ADD COLUMN collections integer[] DEFAULT '{}'::integer[];
ALTER TABLE organizations ADD COLUMN collections integer[] DEFAULT '{}'::integer[];