DROP TABLE IF EXISTS localized_labels;
CREATE TABLE localized_labels(
  language TEXT NOT NULL,
  key TEXT NOT NULL,
  view TEXT,
  edit TEXT,
  UNIQUE(language, key)
);

INSERT INTO localized_labels
SELECT
  'en' AS language,
  key,
  '' AS view,
  value AS edit
FROM
  rotate_case_edit_localized('en')
WHERE
  key NOT LIKE '%_value_%' AND
  key <> 'language'
;

  DELETE FROM localized_labels where key = 'evaluation_reports_label';
  DELETE FROM localized_labels where key = 'evaluation_reports_instructional';
  DELETE FROM localized_labels where key = 'evaluation_reports_info';
  DELETE FROM localized_labels where key = 'evaluation_reports_placeholder';
  DELETE FROM localized_labels where key = 'evaluation_links_label';
  DELETE FROM localized_labels where key = 'evaluation_links_instructional';
  DELETE FROM localized_labels where key = 'evaluation_links_info';
  DELETE FROM localized_labels where key = 'evaluation_links_placeholder';

INSERT INTO localized_labels VALUES
  ('en', 'specific_topics_label', '', 'Specific Topics'),
  ('en', 'specific_topics_instructional', '', 'Rank order up to three of the most relevant, specific topics, with “1” indicating the most relevant topic.'),
  ('en', 'specific_topics_info', '', ''),
  ('en', 'specific_topics_placeholder', '', 'Select & rank up to 3 topics'),
  ('en', 'components_sectionlabel', '', 'Components'),
  ('en', 'tools_techniques_types_label', '', 'General Types of Tools/Techniques'),
  ('en', 'tools_techniques_types_instructional', '', 'Select and rank up to three types that best describe the tools/techniques used in this case, with “1” indicating the most relevant.'),
  ('en', 'tools_techniques_types_info', '', 'There is huge variety in the range of participatory tools/techniques. To help narrow it down, select and rank up to three of the following types that best describe the specific tools/techniques used in this case. Specifying what types of tools/techniques were used is makes it easier for Participedia users to find similar cases.'),
  ('en', 'tools_techniques_types_placeholder', '', 'Select & rank up to 3 types'),
  ('en', 'evaluation_file_label', '', 'Evaluation Report Document'),
  ('en', 'evaluation_file_instructional', '', 'Upload relevant documents here. Supported file types include: rtf, txt, doc, docx, xls, xlsx, pdf, ppt, pptx, pps, ppsx, odt, ods and odp. Max file size is 5MB.'),
  ('en', 'evaluation_file_info', '', ''),
  ('en', 'evaluation_file_placeholder', '', 'Click to select or drag and drop files here'),
  ('en', 'evaluation_file_link_label', '', ''),
  ('en', 'evaluation_file_link_instructional', '', 'If applicable, provide a link to where the original file was sourced.'),
  ('en', 'evaluation_file_link_info', '', ''),
  ('en', 'evaluation_file_link_placeholder', '', 'Link to original'),
  ('en', 'evaluation_file_attribution_label', '', ''),
  ('en', 'evaluation_file_attribution_instructional', '', 'Who is the original owner or creator of this file?'),
  ('en', 'evaluation_file_attribution_info', '', ''),
  ('en', 'evaluation_file_attribution_placeholder', '', 'Owner or creator'),
  ('en', 'evaluation_file_title_label', '', ''),
  ('en', 'evaluation_file_title_instructional', '', 'Provide a title or description of this file in 10 words or less.'),
  ('en', 'evaluation_file_title_info', '', ''),
  ('en', 'evaluation_file_title_placeholder', '', 'Title or description'),
  ('en', 'evaluation_link_label', '', 'Evaluation Report Links'),
  ('en', 'evaluation_link_instructional', '', 'If there is a main website for this case, enter it here. Add links to additional sources so that readers and editors can find more information about this case online. '),
  ('en', 'evaluation_link_info', '', ''),
  ('en', 'evaluation_link_placeholder', '', 'Add link'),
  ('en', 'evaluation_link_attribution_label', '', ''),
  ('en', 'evaluation_link_attribution_instructional', '', 'Who is the original owner or creator of this linked content?'),
  ('en', 'evaluation_link_attribution_info', '', ''),
  ('en', 'evaluation_link_attribution_placeholder', '', 'Owner or creator'),
  ('en', 'evaluation_link_title_label', '', ''),
  ('en', 'evaluation_link_title_instructional', '', 'Provide a title or description of this linked content in 10 words or less.'),
  ('en', 'evaluation_link_title_info', '', ''),
  ('en', 'evaluation_link_title_placeholder', '', 'Title or description')
;

  UPDATE localized_labels SET key = 'purposes_label' where key = 'purpose_label';
  UPDATE localized_labels SET key = 'purposes_instructional' where key = 'purpose_instructional';
  UPDATE localized_labels SET key = 'purposes_info' where key = 'purpose_info';
  UPDATE localized_labels SET key = 'purposes_placeholder' where key = 'purpose_placeholder';
  UPDATE localized_labels SET key = 'approaches_label' where key = 'approach_label';
  UPDATE localized_labels SET key = 'approaches_instructional' where key = 'approach_instructional';
  UPDATE localized_labels SET key = 'approaches_info' where key = 'approach_info';
  UPDATE localized_labels SET key = 'approaches_placeholder' where key = 'approach_placeholder';
  UPDATE localized_labels SET edit = 'This case is ongoing' where key = 'ongoing_instructional';
  UPDATE localized_labels SET key = 'facetoface_online_or_both_label' where key = 'facetoface_label';
  UPDATE localized_labels SET key = 'facetoface_online_or_both_instructional' where key = 'facetoface_instructional';
  UPDATE localized_labels SET key = 'facetoface_online_or_both_info' where key = 'facetoface_info';
  UPDATE localized_labels SET key = 'facetoface_online_or_both_placeholder' where key = 'facetoface_placeholder';
  UPDATE localized_labels SET key = 'participants_interactions_label' where key = 'participants_interaction_label';
  UPDATE localized_labels SET key = 'participants_interactions_instructional' where key = 'participants_interaction_instructional';
  UPDATE localized_labels SET key = 'participants_interactions_info' where key = 'participants_interaction_info';
  UPDATE localized_labels SET key = 'participants_interactions_placeholder' where key = 'participants_interaction_placeholder';
  UPDATE localized_labels SET key = 'organizer_types_label' where key = 'organizer_type_label';
  UPDATE localized_labels SET key = 'organizer_types_instructional' where key = 'organizer_type_instructional';
  UPDATE localized_labels SET key = 'organizer_types_info' where key = 'organizer_type_info';
  UPDATE localized_labels SET key = 'organizer_types_placeholder' where key = 'organizer_type_placeholder';
  UPDATE localized_labels SET key = 'funder_types_label' where key = 'funder_type_label';
  UPDATE localized_labels SET key = 'funder_types_instructional' where key = 'funder_type_instructional';
  UPDATE localized_labels SET key = 'funder_types_info' where key = 'funder_type_info';
  UPDATE localized_labels SET key = 'funder_types_placeholder' where key = 'funder_type_placeholder';

DROP FUNCTION IF EXISTS get_edit_labels(text);
CREATE OR REPLACE FUNCTION get_edit_labels(lang text) RETURNS JSON
   LANGUAGE sql STABLE
   AS $_$
   SELECT json_object_agg(key, edit)
   FROM localized_labels
   WHERE language = lang;
$_$;
