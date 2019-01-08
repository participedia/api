WITH staticrow as (
  SELECT
  get_all_tags(${lang}) as tags,
  get_case_edit_localized_values('general_issues', ${lang}) as general_issues,
  get_case_edit_localized_values('specific_topics', ${lang}) as specific_topics,
  get_case_edit_localized_values('scope', ${lang}) as scope_of_influence,
  get_case_edit_localized_values('time_limited', ${lang}) as time_limited,
  get_case_edit_localized_values('purposes', ${lang}) as purposes,
  get_case_edit_localized_values('approaches', ${lang}) as approaches,
  get_case_edit_localized_values('public_spectrum', ${lang}) as public_spectrum,
  get_case_edit_localized_values('open_limited', ${lang}) as open_limited,
  get_case_edit_localized_values('recruitment_method', ${lang}) as recruitment_method,
  get_case_edit_localized_values('targeted_participants', ${lang}) as targeted_participants,
  get_case_edit_localized_values('method_types', ${lang}) as method_types,
  get_case_edit_localized_values('tool_types', ${lang}) as tools_techniques_types,
  get_case_edit_localized_values('legality', ${lang}) as legality,
  get_case_edit_localized_values('facilitators', ${lang}) as facilitators,
  get_case_edit_localized_values('facilitator_training', ${lang}) as facilitator_training,
  get_case_edit_localized_values('facetoface_online_or_both', ${lang}) as facetoface_online_or_both,
  get_case_edit_localized_values('participants_interactions', ${lang}) as participants_interactions,
  get_case_edit_localized_values('learning_resources', ${lang}) as learning_resources,
  get_case_edit_localized_values('decision_methods', ${lang}) as decision_methods,
  get_case_edit_localized_values('if_voting', ${lang}) as if_voting,
  get_case_edit_localized_values('insights_outcomes', ${lang}) as insights_outcomes,
  get_case_edit_localized_values('organizer_types', ${lang}) as organizer_types,
  get_case_edit_localized_values('funder_types', ${lang}) as funder_types,
  get_case_edit_localized_values('change_types', ${lang}) as change_types,
  get_case_edit_localized_values('implementers_of_change', ${lang}) as implementers_of_change,
  get_edit_labels(${lang}) as labels
)
SELECT to_json(staticrow.*) static FROM staticrow
;
