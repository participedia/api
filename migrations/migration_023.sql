update case_view_localized set "true" = 'True' WHERE language = 'en';
update case_view_localized set "false" = 'False' WHERE language = 'en';

update cases set if_voting = array_replace(if_voting, 'if_voting_value_preferential', 'preferential');

update cases set insights_outcomes = array_replace(insights_outcomes, 'public_hearings/meetings', 'public_hearingsmeetings');

update cases set implementers_of_change = array_replace(implementers_of_change, 'implementers_of_change_value_appointed', 'appointed');
update cases set implementers_of_change = array_replace(implementers_of_change, 'implementers_of_change_value_experts', 'experts');
update cases set implementers_of_change = array_replace(implementers_of_change, 'implementers_of_change_value_stakeholder', 'stakeholder');
