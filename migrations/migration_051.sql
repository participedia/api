-- create new fields

ALTER TABLE things ADD COLUMN reviewed_by TEXT;
ALTER TABLE things ADD COLUMN reviewed_at timestamp;
ALTER TABLE things ADD COLUMN verified boolean default false;