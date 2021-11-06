-- create new fields

ALTER TABLE things ADD COLUMN reviewed_by TEXT;
ALTER TABLE things ADD COLUMN reviewed_at timestamp;