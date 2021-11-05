-- create new fields

ALTER TABLE cases ADD COLUMN reviewed_by TEXT;
ALTER TABLE cases ADD COLUMN reviewed_at timestamp;