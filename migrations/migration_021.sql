update cases set scope_of_influence = 'no_geo' WHERE scope_of_influence = 'no';
update cases set participants_interactions = array_replace(participants_interactions, 'no', 'no_interaction');
update cases set learning_resources = array_replace(learning_resources, 'no', 'no_info');
