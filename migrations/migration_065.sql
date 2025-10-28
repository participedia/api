ALTER TABLE cases
  ADD COLUMN representation_change_who text DEFAULT ''::text,
  ADD COLUMN representation_change_what text DEFAULT ''::text,
  ADD COLUMN represented_shaped text DEFAULT ''::text,
  ADD COLUMN anonymous_identified text DEFAULT ''::text,
  ADD COLUMN represented_characteristics text[] DEFAULT '{}'::text[],
  ADD COLUMN represented_group text[] DEFAULT '{}'::text[],
  ADD COLUMN ai_ml text DEFAULT ''::text,
  ADD COLUMN argument_tools text[] DEFAULT '{}'::text[],
  ADD COLUMN facilitator_automation text DEFAULT ''::text,
  ADD COLUMN facetoface_and_online_integration text DEFAULT ''::text,
  ADD COLUMN gamification text[] DEFAULT '{}'::text[],
  ADD COLUMN synchronous_asynchronous text DEFAULT ''::text,
  ADD COLUMN text_video text DEFAULT ''::text,
  ADD COLUMN visualization text DEFAULT ''::text,
  ADD COLUMN virtual_reality text DEFAULT ''::text,
  ADD COLUMN representation_claims text[] DEFAULT '{}'::text[],
  ADD COLUMN feedback_methods text[] DEFAULT '{}'::text[],
  ADD COLUMN behind_claim text DEFAULT ''::text,
  ADD COLUMN most_affected text DEFAULT ''::text,
  ADD COLUMN implementers_connected text DEFAULT ''::text,
  ADD COLUMN represented_evaluation text DEFAULT ''::text;

 
