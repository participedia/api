CREATE TABLE case_static_localized (
  language TEXT NOT NULL,
  -- title fields
  title_label TEXT DEFAULT 'Localized title_label',
  title_instructional TEXT DEFAULT 'Localized title_instructional',
  title_info TEXT DEFAULT ''::text,
  title_placeholder TEXT DEFAULT 'Localized title_placeholder',
  -- general_issues fields
  general_issues_label TEXT DEFAULT 'Localized general_issues_label',
  general_issues_instructional TEXT DEFAULT 'Localized general_issues_instructional',
  general_issues_info TEXT DEFAULT ''::text,
  general_issues_placeholder TEXT DEFAULT 'Localized general_issues_placeholder',
  -- brief_description fields
  brief_description_label TEXT DEFAULT 'Localized brief_description_label',
  brief_description_instructional TEXT DEFAULT 'Localized brief_description_instructional',
  brief_description_info TEXT DEFAULT ''::text,
  brief_description_placeholder TEXT DEFAULT 'Localized brief_description_placeholder',
  -- body fields
  body_label TEXT DEFAULT 'Localized body_label',
  body_instructional TEXT DEFAULT 'Localized body_instructional',
  body_info TEXT DEFAULT ''::text,
  body_placeholder TEXT DEFAULT 'Localized body_placeholder',
  -- tags fields
  tags_label TEXT DEFAULT 'Localized tags_label',
  tags_instructional TEXT DEFAULT 'Localized tags_instructional',
  tags_info TEXT DEFAULT ''::text,
  tags_placeholder TEXT DEFAULT 'Localized tags_placeholder',
  -- location fields
  location_label TEXT DEFAULT 'Localized location_label',
  location_instructional TEXT DEFAULT 'Localized location_instructional',
  location_info TEXT DEFAULT ''::text,
  location_placeholder TEXT DEFAULT 'Localized location_placeholder',
  -- scope fields
  scope_label TEXT DEFAULT 'Localized scope_label',
  scope_instructional TEXT DEFAULT 'Localized scope_instructional',
  scope_info TEXT DEFAULT ''::text,
  scope_placeholder TEXT DEFAULT 'Localized scope_placeholder',
  -- has_components fields
  has_components_label TEXT DEFAULT 'Localized has_components_label',
  has_components_instructional TEXT DEFAULT 'Localized has_components_instructional',
  has_components_info TEXT DEFAULT ''::text,
  has_components_placeholder TEXT DEFAULT 'Localized has_components_placeholder',
  -- is_component_of fields
  is_component_of_label TEXT DEFAULT 'Localized is_component_of_label',
  is_component_of_instructional TEXT DEFAULT 'Localized is_component_of_instructional',
  is_component_of_info TEXT DEFAULT ''::text,
  is_component_of_placeholder TEXT DEFAULT 'Localized is_component_of_placeholder',
  -- file_upload fields
  file_upload_label TEXT DEFAULT 'Localized file_upload_label',
  file_upload_instructional TEXT DEFAULT 'Localized file_upload_instructional',
  file_upload_info TEXT DEFAULT ''::text,
  file_upload_placeholder TEXT DEFAULT 'Localized file_upload_placeholder',
  -- file_link fields
  file_link_label TEXT DEFAULT 'Localized file_link_label',
  file_link_instructional TEXT DEFAULT 'Localized file_link_instructional',
  file_link_info TEXT DEFAULT ''::text,
  file_link_placeholder TEXT DEFAULT 'Localized file_link_placeholder',
  -- file_attribution fields
  file_attribution_label TEXT DEFAULT 'Localized file_attribution_label',
  file_attribution_instructional TEXT DEFAULT 'Localized file_attribution_instructional',
  file_attribution_info TEXT DEFAULT ''::text,
  file_attribution_placeholder TEXT DEFAULT 'Localized file_attribution_placeholder',
  -- file_title fields
  file_title_label TEXT DEFAULT 'Localized file_title_label',
  file_title_instructional TEXT DEFAULT 'Localized file_title_instructional',
  file_title_info TEXT DEFAULT ''::text,
  file_title_placeholder TEXT DEFAULT 'Localized file_title_placeholder',
  -- link fields
  link_label TEXT DEFAULT 'Localized link_label',
  link_instructional TEXT DEFAULT 'Localized link_instructional',
  link_info TEXT DEFAULT ''::text,
  link_placeholder TEXT DEFAULT 'Localized link_placeholder',
  -- link_attribution fields
  link_attribution_label TEXT DEFAULT 'Localized link_attribution_label',
  link_attribution_instructional TEXT DEFAULT 'Localized link_attribution_instructional',
  link_attribution_info TEXT DEFAULT ''::text,
  link_attribution_placeholder TEXT DEFAULT 'Localized link_attribution_placeholder',
  -- link_title fields
  link_title_label TEXT DEFAULT 'Localized link_title_label',
  link_title_instructional TEXT DEFAULT 'Localized link_title_instructional',
  link_title_info TEXT DEFAULT ''::text,
  link_title_placeholder TEXT DEFAULT 'Localized link_title_placeholder',
  -- photo_upload fields
  photo_upload_label TEXT DEFAULT 'Localized photo_upload_label',
  photo_upload_instructional TEXT DEFAULT 'Localized photo_upload_instructional',
  photo_upload_info TEXT DEFAULT ''::text,
  photo_upload_placeholder TEXT DEFAULT 'Localized photo_upload_placeholder',
  -- photo_link fields
  photo_link_label TEXT DEFAULT 'Localized photo_link_label',
  photo_link_instructional TEXT DEFAULT 'Localized photo_link_instructional',
  photo_link_info TEXT DEFAULT ''::text,
  photo_link_placeholder TEXT DEFAULT 'Localized photo_link_placeholder',
  -- photo_attribution fields
  photo_attribution_label TEXT DEFAULT 'Localized photo_attribution_label',
  photo_attribution_instructional TEXT DEFAULT 'Localized photo_attribution_instructional',
  photo_attribution_info TEXT DEFAULT ''::text,
  photo_attribution_placeholder TEXT DEFAULT 'Localized photo_attribution_placeholder',
  -- photo_title fields
  photo_title_label TEXT DEFAULT 'Localized photo_title_label',
  photo_title_instructional TEXT DEFAULT 'Localized photo_title_instructional',
  photo_title_info TEXT DEFAULT ''::text,
  photo_title_placeholder TEXT DEFAULT 'Localized photo_title_placeholder',
  -- video_link fields
  video_link_label TEXT DEFAULT 'Localized video_link_label',
  video_link_instructional TEXT DEFAULT 'Localized video_link_instructional',
  video_link_info TEXT DEFAULT ''::text,
  video_link_placeholder TEXT DEFAULT 'Localized video_link_placeholder',
  -- video_attribution fields
  video_attribution_label TEXT DEFAULT 'Localized video_attribution_label',
  video_attribution_instructional TEXT DEFAULT 'Localized video_attribution_instructional',
  video_attribution_info TEXT DEFAULT ''::text,
  video_attribution_placeholder TEXT DEFAULT 'Localized video_attribution_placeholder',
  -- video_title fields
  video_title_label TEXT DEFAULT 'Localized video_title_label',
  video_title_instructional TEXT DEFAULT 'Localized video_title_instructional',
  video_title_info TEXT DEFAULT ''::text,
  video_title_placeholder TEXT DEFAULT 'Localized video_title_placeholder',
  -- audio_link fields
  audio_link_label TEXT DEFAULT 'Localized audio_link_label',
  audio_link_instructional TEXT DEFAULT 'Localized audio_link_instructional',
  audio_link_info TEXT DEFAULT ''::text,
  audio_link_placeholder TEXT DEFAULT 'Localized audio_link_placeholder',
  -- audio_attribution fields
  audio_attribution_label TEXT DEFAULT 'Localized audio_attribution_label',
  audio_attribution_instructional TEXT DEFAULT 'Localized audio_attribution_instructional',
  audio_attribution_info TEXT DEFAULT ''::text,
  audio_attribution_placeholder TEXT DEFAULT 'Localized audio_attribution_placeholder',
  -- audio_title fields
  audio_title_label TEXT DEFAULT 'Localized audio_title_label',
  audio_title_instructional TEXT DEFAULT 'Localized audio_title_instructional',
  audio_title_info TEXT DEFAULT ''::text,
  audio_title_placeholder TEXT DEFAULT 'Localized audio_title_placeholder',
  -- start_date fields
  start_date_label TEXT DEFAULT 'Localized start_date_label',
  start_date_instructional TEXT DEFAULT 'Localized start_date_instructional',
  start_date_info TEXT DEFAULT ''::text,
  start_date_placeholder TEXT DEFAULT 'Localized start_date_placeholder',
  -- end_date fields
  end_date_label TEXT DEFAULT 'Localized end_date_label',
  end_date_instructional TEXT DEFAULT 'Localized end_date_instructional',
  end_date_info TEXT DEFAULT ''::text,
  end_date_placeholder TEXT DEFAULT 'Localized end_date_placeholder',
  -- ongoing fields
  ongoing_label TEXT DEFAULT 'Localized ongoing_label',
  ongoing_instructional TEXT DEFAULT 'Localized ongoing_instructional',
  ongoing_info TEXT DEFAULT ''::text,
  ongoing_placeholder TEXT DEFAULT 'Localized ongoing_placeholder',
  -- time_limited fields
  time_limited_label TEXT DEFAULT 'Localized time_limited_label',
  time_limited_instructional TEXT DEFAULT 'Localized time_limited_instructional',
  time_limited_info TEXT DEFAULT ''::text,
  time_limited_placeholder TEXT DEFAULT 'Localized time_limited_placeholder',
  -- purpose fields
  purpose_label TEXT DEFAULT 'Localized purpose_label',
  purpose_instructional TEXT DEFAULT 'Localized purpose_instructional',
  purpose_info TEXT DEFAULT ''::text,
  purpose_placeholder TEXT DEFAULT 'Localized purpose_placeholder',
  -- approach fields
  approach_label TEXT DEFAULT 'Localized approach_label',
  approach_instructional TEXT DEFAULT 'Localized approach_instructional',
  approach_info TEXT DEFAULT ''::text,
  approach_placeholder TEXT DEFAULT 'Localized approach_placeholder',
  -- public_spectrum fields
  public_spectrum_label TEXT DEFAULT 'Localized public_spectrum_label',
  public_spectrum_instructional TEXT DEFAULT 'Localized public_spectrum_instructional',
  public_spectrum_info TEXT DEFAULT ''::text,
  public_spectrum_placeholder TEXT DEFAULT 'Localized public_spectrum_placeholder',
  -- number_of_participants fields
  number_of_participants_label TEXT DEFAULT 'Localized number_of_participants_label',
  number_of_participants_instructional TEXT DEFAULT 'Localized number_of_participants_instructional',
  number_of_participants_info TEXT DEFAULT ''::text,
  number_of_participants_placeholder TEXT DEFAULT 'Localized number_of_participants_placeholder',
  -- open_limited fields
  open_limited_label TEXT DEFAULT 'Localized open_limited_label',
  open_limited_instructional TEXT DEFAULT 'Localized open_limited_instructional',
  open_limited_info TEXT DEFAULT ''::text,
  open_limited_placeholder TEXT DEFAULT 'Localized open_limited_placeholder',
  -- recruitment_method fields
  recruitment_method_label TEXT DEFAULT 'Localized recruitment_method_label',
  recruitment_method_instructional TEXT DEFAULT 'Localized recruitment_method_instructional',
  recruitment_method_info TEXT DEFAULT ''::text,
  recruitment_method_placeholder TEXT DEFAULT 'Localized recruitment_method_placeholder',
  -- targeted_participants fields
  targeted_participants_label TEXT DEFAULT 'Localized targeted_participants_label',
  targeted_participants_instructional TEXT DEFAULT 'Localized targeted_participants_instructional',
  targeted_participants_info TEXT DEFAULT ''::text,
  targeted_participants_placeholder TEXT DEFAULT 'Localized targeted_participants_placeholder',
  -- method_types fields
  method_types_label TEXT DEFAULT 'Localized method_types_label',
  method_types_instructional TEXT DEFAULT 'Localized method_types_instructional',
  method_types_info TEXT DEFAULT ''::text,
  method_types_placeholder TEXT DEFAULT 'Localized method_types_placeholder',
  -- tool_types fields
  tool_types_label TEXT DEFAULT 'Localized tool_types_label',
  tool_types_instructional TEXT DEFAULT 'Localized tool_types_instructional',
  tool_types_info TEXT DEFAULT ''::text,
  tool_types_placeholder TEXT DEFAULT 'Localized tool_types_placeholder',
  -- specific_tools fields
  specific_tools_label TEXT DEFAULT 'Localized specific_tools_label',
  specific_tools_instructional TEXT DEFAULT 'Localized specific_tools_instructional',
  specific_tools_info TEXT DEFAULT ''::text,
  specific_tools_placeholder TEXT DEFAULT 'Localized specific_tools_placeholder',
  -- legality fields
  legality_label TEXT DEFAULT 'Localized legality_label',
  legality_instructional TEXT DEFAULT 'Localized legality_instructional',
  legality_info TEXT DEFAULT ''::text,
  legality_placeholder TEXT DEFAULT 'Localized legality_placeholder',
  -- facilitators fields
  facilitators_label TEXT DEFAULT 'Localized facilitators_label',
  facilitators_instructional TEXT DEFAULT 'Localized facilitators_instructional',
  facilitators_info TEXT DEFAULT ''::text,
  facilitators_placeholder TEXT DEFAULT 'Localized facilitators_placeholder',
  -- facilitator_training fields
  facilitator_training_label TEXT DEFAULT 'Localized facilitator_training_label',
  facilitator_training_instructional TEXT DEFAULT 'Localized facilitator_training_instructional',
  facilitator_training_info TEXT DEFAULT ''::text,
  facilitator_training_placeholder TEXT DEFAULT 'Localized facilitator_training_placeholder',
  -- facetoface fields
  facetoface_label TEXT DEFAULT 'Localized facetoface_label',
  facetoface_instructional TEXT DEFAULT 'Localized facetoface_instructional',
  facetoface_info TEXT DEFAULT ''::text,
  facetoface_placeholder TEXT DEFAULT 'Localized facetoface_placeholder',
  -- participants_interaction fields
  participants_interaction_label TEXT DEFAULT 'Localized participants_interaction_label',
  participants_interaction_instructional TEXT DEFAULT 'Localized participants_interaction_instructional',
  participants_interaction_info TEXT DEFAULT ''::text,
  participants_interaction_placeholder TEXT DEFAULT 'Localized participants_interaction_placeholder',
  -- learning_resources fields
  learning_resources_label TEXT DEFAULT 'Localized learning_resources_label',
  learning_resources_instructional TEXT DEFAULT 'Localized learning_resources_instructional',
  learning_resources_info TEXT DEFAULT ''::text,
  learning_resources_placeholder TEXT DEFAULT 'Localized learning_resources_placeholder',
  -- decision_methods fields
  decision_methods_label TEXT DEFAULT 'Localized decision_methods_label',
  decision_methods_instructional TEXT DEFAULT 'Localized decision_methods_instructional',
  decision_methods_info TEXT DEFAULT ''::text,
  decision_methods_placeholder TEXT DEFAULT 'Localized decision_methods_placeholder',
  -- if_voting fields
  if_voting_label TEXT DEFAULT 'Localized if_voting_label',
  if_voting_instructional TEXT DEFAULT 'Localized if_voting_instructional',
  if_voting_info TEXT DEFAULT ''::text,
  if_voting_placeholder TEXT DEFAULT 'Localized if_voting_placeholder',
  -- insights_outcomes fields
  insights_outcomes_label TEXT DEFAULT 'Localized insights_outcomes_label',
  insights_outcomes_instructional TEXT DEFAULT 'Localized insights_outcomes_instructional',
  insights_outcomes_info TEXT DEFAULT ''::text,
  insights_outcomes_placeholder TEXT DEFAULT 'Localized insights_outcomes_placeholder',
  -- primary_organizer fields
  primary_organizer_label TEXT DEFAULT 'Localized primary_organizer_label',
  primary_organizer_instructional TEXT DEFAULT 'Localized primary_organizer_instructional',
  primary_organizer_info TEXT DEFAULT ''::text,
  primary_organizer_placeholder TEXT DEFAULT 'Localized primary_organizer_placeholder',
  -- organizer_type fields
  organizer_type_label TEXT DEFAULT 'Localized organizer_type_label',
  organizer_type_instructional TEXT DEFAULT 'Localized organizer_type_instructional',
  organizer_type_info TEXT DEFAULT ''::text,
  organizer_type_placeholder TEXT DEFAULT 'Localized organizer_type_placeholder',
  -- funder fields
  funder_label TEXT DEFAULT 'Localized funder_label',
  funder_instructional TEXT DEFAULT 'Localized funder_instructional',
  funder_info TEXT DEFAULT ''::text,
  funder_placeholder TEXT DEFAULT 'Localized funder_placeholder',
  -- funder_types fields
  funder_types_label TEXT DEFAULT 'Localized funder_types_label',
  funder_types_instructional TEXT DEFAULT 'Localized funder_types_instructional',
  funder_types_info TEXT DEFAULT ''::text,
  funder_types_placeholder TEXT DEFAULT 'Localized funder_types_placeholder',
  -- staff fields
  staff_label TEXT DEFAULT 'Localized staff_label',
  staff_instructional TEXT DEFAULT 'Localized staff_instructional',
  staff_info TEXT DEFAULT ''::text,
  staff_placeholder TEXT DEFAULT 'Localized staff_placeholder',
  -- volunteers fields
  volunteers_label TEXT DEFAULT 'Localized volunteers_label',
  volunteers_instructional TEXT DEFAULT 'Localized volunteers_instructional',
  volunteers_info TEXT DEFAULT ''::text,
  volunteers_placeholder TEXT DEFAULT 'Localized volunteers_placeholder',
  -- impact_evidence fields
  impact_evidence_label TEXT DEFAULT 'Localized impact_evidence_label',
  impact_evidence_instructional TEXT DEFAULT 'Localized impact_evidence_instructional',
  impact_evidence_info TEXT DEFAULT ''::text,
  impact_evidence_placeholder TEXT DEFAULT 'Localized impact_evidence_placeholder',
  -- change_types fields
  change_types_label TEXT DEFAULT 'Localized change_types_label',
  change_types_instructional TEXT DEFAULT 'Localized change_types_instructional',
  change_types_info TEXT DEFAULT ''::text,
  change_types_placeholder TEXT DEFAULT 'Localized change_types_placeholder',
  -- implementers_of_change fields
  implementers_of_change_label TEXT DEFAULT 'Localized implementers_of_change_label',
  implementers_of_change_instructional TEXT DEFAULT 'Localized implementers_of_change_instructional',
  implementers_of_change_info TEXT DEFAULT ''::text,
  implementers_of_change_placeholder TEXT DEFAULT 'Localized implementers_of_change_placeholder',
  -- formal_evaluation fields
  formal_evaluation_label TEXT DEFAULT 'Localized formal_evaluation_label',
  formal_evaluation_instructional TEXT DEFAULT 'Localized formal_evaluation_instructional',
  formal_evaluation_info TEXT DEFAULT ''::text,
  formal_evaluation_placeholder TEXT DEFAULT 'Localized formal_evaluation_placeholder',
  -- evaluation_reports fields
  evaluation_reports_label TEXT DEFAULT 'Localized evaluation_reports_label',
  evaluation_reports_instructional TEXT DEFAULT 'Localized evaluation_reports_instructional',
  evaluation_reports_info TEXT DEFAULT ''::text,
  evaluation_reports_placeholder TEXT DEFAULT 'Localized evaluation_reports_placeholder',
  -- evaluation_links fields
  evaluation_links_label TEXT DEFAULT 'Localized evaluation_links_label',
  evaluation_links_instructional TEXT DEFAULT 'Localized evaluation_links_instructional',
  evaluation_links_info TEXT DEFAULT ''::text,
  evaluation_links_placeholder TEXT DEFAULT 'Localized evaluation_links_placeholder'
);

CREATE TABLE sections_static_localized (
  language TEXT NOT NULL,
  quick_submit_sectionlabel TEXT DEFAULT 'Localized quick_submit_sectionlabel',
  overview_sectionlabel TEXT DEFAULT 'Localized overview_sectionlabel',
  location_sectionlabel TEXT DEFAULT 'Localized location_sectionlabel',
  media_sectionlabel TEXT DEFAULT 'Localized media_sectionlabel',
  date_sectionlabel TEXT DEFAULT 'Localized date_sectionlabel',
  purpose_sectionlabel TEXT DEFAULT 'Localized purpose_sectionlabel',
  participants_sectionlabel TEXT DEFAULT 'Localized participants_sectionlabel',
  process_sectionlabel TEXT DEFAULT 'Localized process_sectionlabel',
  organizers_sectionlabel TEXT DEFAULT 'Localized organizers_sectionlabel',
  resources_sectionlabel TEXT DEFAULT 'Localized resources_sectionlabel',
  evidence_sectionlabel TEXT DEFAULT 'Localized evidence_sectionlabel'
);
