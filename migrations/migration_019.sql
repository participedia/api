update cases set public_spectrum = '' where public_spectrum = NULL;

update cases set open_limited = 'open' where open_limited = 'open_to_all';
update cases set open_limited = 'open_to' where open_limited = 'open_to_all_with_special_effort_to_recruit_some_groups_eg_community_organizing_to_recruit_lowincome_earners';
update cases set open_limited = 'limited' where open_limited = 'limited_to_only_some_groups_or_individuals';

update cases set recruitment_method = 'random' where recruitment_method = 'random_sample';
update cases set recruitment_method = 'not' where recruitment_method = 'na';
update cases set recruitment_method = 'captive' where recruitment_method = 'captive_sample';
update cases set recruitment_method = '' where recruitment_method = NULL;

update cases set targeted_participants = array_replace(targeted_participants, 'appointed_public_servants_eg_bureaucrats', 'appointed');
update cases set targeted_participants = array_replace(targeted_participants, 'elected_public_officials', 'elected');
update cases set targeted_participants = array_replace(targeted_participants, 'experts_eg_scientists', 'experts');
update cases set targeted_participants = array_replace(targeted_participants, 'gay/lesbian/bisexual/transgender_ie_lgbt', 'lgbt');
update cases set targeted_participants = array_replace(targeted_participants, 'indigenous_people', 'indigenous');
update cases set targeted_participants = array_replace(targeted_participants, 'lowincome_earners', 'lowincome');
update cases set targeted_participants = array_remove(targeted_participants, 'other');
update cases set targeted_participants = array_replace(targeted_participants, 'people_with_disabilities', 'people');
update cases set targeted_participants = array_replace(targeted_participants, 'racial/ethnic_groups', 'racialethnic');
update cases set targeted_participants = array_replace(targeted_participants, 'religious_groups', 'religious');
update cases set targeted_participants = array_replace(targeted_participants, 'stakeholder_organizations_eg_ngos_business_interests', 'stakeholder');

update cases set facilitators = 'yes' where facilitators = 'true';
update cases set facilitators = 'no' where facilitators = 'false';
update cases set facilitators = '' where facilitators = NULL;

update cases set facilitator_training = '' where facilitator_training = '{}';
update cases set facilitator_training = 'professional' where facilitator_training = 'professional_facilitators';
update cases set facilitator_training = 'trained' where facilitator_training = 'trained_nonprofessional_facilitators';
update cases set facilitator_training = 'untrained' where facilitator_training = 'untrained_nonprofessional_facilitators';

update cases set facetoface_online_or_both = '' where facetoface_online_or_both = '';
update cases set facetoface_online_or_both = '' where facetoface_online_or_both = '';
update cases set facetoface_online_or_both = '' where facetoface_online_or_both = '';
update cases set facetoface_online_or_both = '' where facetoface_online_or_both = '';

update cases set participants_interactions = array_replace(participants_interactions, 'acting_drama', 'acting');
update cases set participants_interactions = array_replace(participants_interactions, 'ask_and_answer_questions', 'ask');
update cases set participants_interactions = array_replace(participants_interactions, 'discussion_dialogue_or_deliberation', 'discussion');
update cases set participants_interactions = array_replace(participants_interactions, 'express_opinions_preferences_only', 'express');
update cases set participants_interactions = array_replace(participants_interactions, 'formal_testimony', 'formal');
update cases set participants_interactions = array_replace(participants_interactions, 'informal_social_activities', 'informal');
update cases set participants_interactions = array_replace(participants_interactions, 'listen_watch_as_spectator', 'listenwatch');
update cases set participants_interactions = array_replace(participants_interactions, 'negotiation_bargaining', 'negotiation');
update cases set participants_interactions = array_replace(participants_interactions, 'no_interaction_among_participants', 'no');
update cases set participants_interactions = array_replace(participants_interactions, '[object Object]', '');
update cases set participants_interactions = array_replace(participants_interactions, 'teaching_instructing', 'teachinginstructing');

update cases set learning_resources = array_replace(learning_resources, 'expert_presentations', 'expert');
update cases set learning_resources = array_replace(learning_resources, 'not_relevant_to_this_type_of_initiative', 'not');
update cases set learning_resources = array_replace(learning_resources, 'participant_presentations', 'participant');
update cases set learning_resources = array_replace(learning_resources, 'site_visits', 'site');
update cases set learning_resources = array_replace(learning_resources, 'video_presentations_online_or_inperson', 'video');
update cases set learning_resources = array_replace(learning_resources, 'written_briefing_materials_online_or_as_handouts', 'written');

update cases set decision_methods = array_replace(decision_methods, 'general_agreement/consensus', 'general');
update cases set decision_methods = array_replace(decision_methods, 'idea_generation', 'idea');
update cases set decision_methods = array_replace(decision_methods, 'not_applicable_decision', 'na');
update cases set decision_methods = array_replace(decision_methods, 'not_applicable', 'na');
update cases set decision_methods = array_replace(decision_methods, 'opinion_survey', 'opinion');
update cases set decision_methods = array_replace(decision_methods, 'unknown_decision', 'dont');
update cases set decision_methods = array_replace(decision_methods, 'voting_decision', 'voting');
update cases set decision_methods = array_replace(decision_methods, 'expert_presentations', 'expert');

update cases set if_voting = array_remove(if_voting, 'consensus');
update cases set if_voting = array_remove(if_voting, '[object Object]');
update cases set if_voting = array_replace(if_voting, 'preferential_voting', 'preferential');

update cases set insights_outcomes = array_replace(insights_outcomes, 'artistic_expression', 'artistic');
update cases set insights_outcomes = array_replace(insights_outcomes, 'independent_media', 'independent');
update cases set insights_outcomes = array_replace(insights_outcomes, 'new_media', 'new');
update cases set insights_outcomes = array_remove(insights_outcomes, 'policy_recommendations');
update cases set insights_outcomes = array_replace(insights_outcomes, 'protests_public_demonstrations', 'insights_outcomes_value_protestspublic');
update cases set insights_outcomes = array_replace(insights_outcomes, 'public_hearings_meetings', 'public_hearingsmeetings');
update cases set insights_outcomes = array_replace(insights_outcomes, 'public_hearingsmeetings', 'public_hearingsmeetings');
update cases set insights_outcomes = array_replace(insights_outcomes, 'public_report', 'public');
update cases set insights_outcomes = array_replace(insights_outcomes, 'traditional_media', 'traditional');
update cases set insights_outcomes = array_replace(insights_outcomes, 'word_of_mouth', 'word');

update cases set organizer_types = array_replace(organizer_types, 'academic_institution', 'academic');
update cases set organizer_types = array_replace(organizer_types, 'activist_network', 'activist');
update cases set organizer_types = array_replace(organizer_types, 'community_based_organization', 'community');
update cases set organizer_types = array_replace(organizer_types, 'faithbased_organization', 'faithbased');
update cases set organizer_types = array_replace(organizer_types, 'forprofit_business', 'forprofit');
update cases set organizer_types = array_replace(organizer_types, 'governmentowned_corporation', 'governmentowned');
update cases set organizer_types = array_replace(organizer_types, 'international_organization', 'international');
update cases set organizer_types = array_replace(organizer_types, 'labor_trade_union', 'labortrade');
update cases set organizer_types = array_replace(organizer_types, 'local_government', 'local');
update cases set organizer_types = array_replace(organizer_types, 'nongovernmental_organization', 'nongovernmental');
update cases set organizer_types = array_replace(organizer_types, 'philanthropic_organization_ie_dedicated_to_making_monetary_grants_or_gifts', 'philanthropic');
update cases set organizer_types = array_replace(organizer_types, 'regional_government_eg_state_provincial_territorial', 'regional');
update cases set organizer_types = array_replace(organizer_types, 'social_movement', 'social');


update cases set funder_types = array_replace(funder_types, 'academic_institution', 'academic');
update cases set funder_types = array_replace(funder_types, 'community_based_organization', 'community');
update cases set funder_types = array_replace(funder_types, 'faithbased_organization', 'faithbased');
update cases set funder_types = array_replace(funder_types, 'forprofit_business', 'forprofit');
update cases set funder_types = array_replace(funder_types, 'governmentowned_corporation', 'governmentowned');
update cases set funder_types = array_replace(funder_types, 'international_organization', 'international');
update cases set funder_types = array_replace(funder_types, 'labor_trade_union', 'labortrade');
update cases set funder_types = array_replace(funder_types, 'local_government', 'local');
update cases set funder_types = array_replace(funder_types, 'national_government', 'national');
update cases set funder_types = array_replace(funder_types, 'nongovernmental_organization', 'nongovernmental');
update cases set funder_types = array_replace(funder_types, 'philanthropic_organization_ie_dedicated_to_making_monetary_grants_or_gifts', 'philanthropic');
update cases set funder_types = array_replace(funder_types, 'regional_government_eg_state_provincial_territorial', 'regional');

update cases set impact_evidence = NULL where impact_evidence = 'dont_know';

update cases set change_types = array_replace(change_types, 'change_types_value_changes', 'changes');
update cases set change_types = array_replace(change_types, 'change_types_value_changes_public', 'changes_public');
update cases set change_types = array_replace(change_types, 'change_types_value_conflict', 'conflict');

update cases set implementers_of_change = array_replace(implementers_of_change, 'appointed_public_servants', 'appointed');
update cases set implementers_of_change = array_replace(implementers_of_change, 'elected_public_officials', 'elected');
update cases set implementers_of_change = array_replace(implementers_of_change, 'lay_public', 'lay');
update cases set implementers_of_change = array_replace(implementers_of_change, 'stakeholder_organizations', 'stakeholder');

update cases set formal_evaluation = NULL where formal_evaluation = '';
update cases set formal_evaluation = NULL where formal_evaluation = 'dont_know';
