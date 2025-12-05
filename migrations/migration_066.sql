ALTER TABLE cases
  ADD COLUMN theme text[] DEFAULT '{}'::text[],
  ADD COLUMN impact_outcome SET DEFAULT ''::text;
