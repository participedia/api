-- CREATE TABLE tags_localized (
--   language TEXT NOT NULL,
--   accessibility TEXT DEFAULT 'Localized accessibility',
--   activism TEXT DEFAULT 'Localized activism',
--   agenda TEXT DEFAULT 'Localized agenda',
--   animal TEXT DEFAULT 'Localized animal',
--   architecture TEXT DEFAULT 'Localized architecture',
--   capacity TEXT DEFAULT 'Localized capacity',
--   civic_infra TEXT DEFAULT 'Localized civic_infra',
--   civic_roles TEXT DEFAULT 'Localized civic_roles',
--   civil TEXT DEFAULT 'Localized civil',
--   conflict TEXT DEFAULT 'Localized conflict',
--   decision TEXT DEFAULT 'Localized decision',
--   democratic TEXT DEFAULT 'Localized democratic',
--   dialogue TEXT DEFAULT 'Localized dialogue',
--   digital TEXT DEFAULT 'Localized digital',
--   direct TEXT DEFAULT 'Localized direct',
--   educational TEXT DEFAULT 'Localized educational',
--   empowerment TEXT DEFAULT 'Localized empowerment',
--   environment TEXT DEFAULT 'Localized environment',
--   formal TEXT DEFAULT 'Localized formal',
--   gender TEXT DEFAULT 'Localized gender',
--   global TEXT DEFAULT 'Localized global',
--   human TEXT DEFAULT 'Localized human',
--   inclusiveness TEXT DEFAULT 'Localized inclusiveness',
--   indigenous TEXT DEFAULT 'Localized indigenous',
--   informal TEXT DEFAULT 'Localized informal',
--   initiative TEXT DEFAULT 'Localized initiative',
--   internal TEXT DEFAULT 'Localized internal',
--   mapping TEXT DEFAULT 'Localized mapping',
--   online TEXT DEFAULT 'Localized online',
--   oversight TEXT DEFAULT 'Localized oversight',
--   participatory TEXT DEFAULT 'Localized participatory',
--   planning TEXT DEFAULT 'Localized planning',
--   political TEXT DEFAULT 'Localized political',
--   public_opinion TEXT DEFAULT 'Localized public_opinion',
--   public_services TEXT DEFAULT 'Localized public_services',
--   race TEXT DEFAULT 'Localized race',
--   research TEXT DEFAULT 'Localized research',
--   rural TEXT DEFAULT 'Localized rural',
--   science TEXT DEFAULT 'Localized science',
--   social_media TEXT DEFAULT 'Localized social_media',
--   social_welfare TEXT DEFAULT 'Localized social_welfare',
--   stateholder TEXT DEFAULT 'Localized stateholder',
--   storytelling TEXT DEFAULT 'Localized storytelling',
--   sustainability TEXT DEFAULT 'Localized sustainability',
--   transparency TEXT DEFAULT 'Localized transparency',
--   urban TEXT DEFAULT 'Localized urban',
--   youth TEXT DEFAULT 'Localized youth'
-- );
--
-- INSERT INTO tags_localized VALUES(
--   'en',
--   'Accessibility',
--   'Activism',
--   'Agenda Formation',
--   'Animal Protection & Welfare',
--   'Architecture & Design',
--   'Capacity Building',
--   'Civic Infrastructure',
--   'Civic Roles & Powers',
--   'Civil Infrastructure',
--   'Conflict Resolution',
--   'Decision-Making',
--   'Democratic Innovation',
--   'Dialogue & Deliberation',
--   'Digital/New Technologies',
--   'Direct Action',
--   'Educational Resources & Opportunities',
--   'Empowerment',
--   'Environment',
--   'Formal/Structured Participation',
--   'Gender',
--   'Global Affairs',
--   'Human Rights',
--   'Inclusiveness',
--   'Indigenous Issues',
--   'Informal Participation',
--   'Initiative Process',
--   'Internal- & Self-Management',
--   'Mapping & Analysis',
--   'Online',
--   'Oversight & Monitoring',
--   'Participatory Budgeting',
--   'Planning & Development',
--   'Political Institutions',
--   'Public Opinion',
--   'Public Services',
--   'Race',
--   'Research/Study',
--   'Rural',
--   'Science Communication',
--   'Social Media',
--   'Social Welfare',
--   'Stakeholder Engagement',
--   'Storytelling',
--   'Sustainability & Green Living',
--   'Transparency & Accountability',
--   'Urban',
--   'Youth & Student Engagement'
-- );

update things set tags = array_remove(tags, '1st amendment');
update things set tags = array_remove(tags, 'airesis');
update things set tags = array_remove(tags, 'alpine environment');
update things set tags = array_remove(tags,  $_$'Americans Elect' 'Colton Schweitzer' 'Tony Elia'$_$);
update things set tags = array_remove(tags, 'applied innovation');
update things set tags = array_remove(tags, 'art');
update things set tags = array_remove(tags, 'assembly');
update things set tags = array_remove(tags, 'association');
update things set tags = array_remove(tags, 'autonomous regions');
update things set tags = array_remove(tags, 'Autonomy');
update things set tags = array_remove(tags, 'australia');
update things set tags = array_remove(tags, 'Australia DirectDemocracy');
update things set tags = array_remove(tags, 'Backbone Campaign');
update things set tags = array_remove(tags, 'big data');
update things set tags = array_remove(tags, 'bilancio partecipativo');
update things set tags = array_remove(tags, 'Blasphemy Laws');
update things set tags = array_remove(tags, 'Bürgerbeteiligung');
update things set tags = array_remove(tags, 'Bürgerhaushalt');
update things set tags = array_remove(tags, 'California Citizens Redistrciting Commission Proposition 11 Voters First Act Senate Assembly Board of Equalization');
update things set tags = array_remove(tags, 'Canada');
update things set tags = array_remove(tags, 'canadian');
update things set tags = array_remove(tags, 'change');
update things set tags = array_remove(tags, 'changeagent');
update things set tags = array_remove(tags, 'changeagents');
update things set tags = array_remove(tags, 'CIR');
update things set tags = array_remove(tags, 'Citizen Deliberation');
update things set tags = array_remove(tags, 'citizen engagement');
update things set tags = array_remove(tags, 'citizen panel');
update things set tags = array_remove(tags, 'Citizen Participation');
update things set tags = array_remove(tags, 'citizens');
update things set tags = array_remove(tags, 'citizens assembly');
update things set tags = array_remove(tags, 'Citizens for Democracy');
update things set tags = array_remove(tags, 'Citizens Initiative Review');
update things set tags = array_remove(tags, 'citizens jury');
update things set tags = array_remove(tags, 'citizens'' jury');
update things set tags = array_remove(tags, 'Citizen Wisdom Council');
update things set tags = array_remove(tags, 'city council');
update things set tags = array_remove(tags, 'Civic Council');
update things set tags = array_remove(tags, 'climate');
update things set tags = array_remove(tags, 'coalition');
update things set tags = array_remove(tags, 'co-creation');
update things set tags = array_remove(tags, 'co-design');
update things set tags = array_remove(tags, 'collaboration');
update things set tags = array_remove(tags, 'collaborative governance');
update things set tags = array_remove(tags, 'Communities');
update things set tags = array_remove(tags, 'community');
update things set tags = array_remove(tags, 'community-academic partnership');
update things set tags = array_remove(tags, 'Community and Voluntray Sector');
update things set tags = array_remove(tags, 'community based organization');
update things set tags = array_remove(tags, 'Community-based participatory research');
update things set tags = array_remove(tags, 'community capacity building');
update things set tags = array_remove(tags, 'community development');
update things set tags = array_remove(tags, 'Community Development');
update things set tags = array_remove(tags, 'community-engaged scholarship');
update things set tags = array_remove(tags, 'community engagement');
update things set tags = array_remove(tags, 'community engagements');
update things set tags = array_remove(tags, 'Community Places');
update things set tags = array_remove(tags, 'Community Planning');
update things set tags = array_remove(tags, 'comune');
update things set tags = array_remove(tags, 'comune italiano');
update things set tags = array_remove(tags, 'Conflict Resolution');
update things set tags = array_remove(tags, 'Consciousness-raising');
update things set tags = array_remove(tags, 'consensus conference');
update things set tags = array_remove(tags, 'conservatism');
update things set tags = array_remove(tags, 'Constitution');
update things set tags = array_remove(tags, 'coopertion');
update things set tags = array_remove(tags, 'copyright');
update things set tags = array_remove(tags, 'corporate social responsibility');
update things set tags = array_remove(tags, 'corruption');
update things set tags = array_remove(tags, 'Creative Insight council');
update things set tags = array_remove(tags, 'critical reporting');
update things set tags = array_remove(tags, 'Crowdmapping');
update things set tags = array_remove(tags, 'Crowdsourcing');
update things set tags = array_remove(tags, 'culture');
update things set tags = array_remove(tags, 'david mathews center for civic live engagement deliberation alabama');
update things set tags = array_remove(tags, 'decision making');
update things set tags = array_remove(tags, 'Decision-Making');
update things set tags = array_remove(tags, 'deeper democracy');
update things set tags = array_remove(tags, 'deliberation');
update things set tags = array_remove(tags, 'Deliberative');
update things set tags = array_remove(tags, 'Democratici Diretti');
update things set tags = array_remove(tags, 'democrazia partecipativa');
update things set tags = array_remove(tags, 'demopart');
update things set tags = array_remove(tags, 'Development');
update things set tags = array_remove(tags, 'development projects');
update things set tags = array_remove(tags, 'diseño Colaborativo');
update things set tags = array_remove(tags, 'Diseño participativo');
update things set tags = array_remove(tags, 'diseño social');
update things set tags = array_remove(tags, 'dissent');
update things set tags = array_remove(tags, 'Dynamic Facilitation');
update things set tags = array_remove(tags, 'dynamic governance');
update things set tags = array_remove(tags, 'easw');
update things set tags = array_remove(tags, 'Economic Justice');
update things set tags = array_remove(tags, 'edem');
update things set tags = array_remove(tags, 'edemocracy');
update things set tags = array_remove(tags, 'e-democracy');
update things set tags = array_remove(tags, 'egovernment');
update things set tags = array_remove(tags, 'e-government');
update things set tags = array_remove(tags, 'energy');
update things set tags = array_remove(tags, 'Engagement');
update things set tags = array_remove(tags, 'eparticipation');
update things set tags = array_remove(tags, 'e-participation');
update things set tags = array_remove(tags, 'Equality');
update things set tags = array_remove(tags, 'Europe');
update things set tags = array_remove(tags, 'european awarness scenario workshop');
update things set tags = array_remove(tags, 'evolution');
update things set tags = array_remove(tags, 'EZLN');
update things set tags = array_remove(tags, 'Facebook application');
update things set tags = array_remove(tags, 'facilitation');
update things set tags = array_remove(tags, 'facilitator');
update things set tags = array_remove(tags, 'federalism');
update things set tags = array_remove(tags, 'film');
update things set tags = array_remove(tags, 'finance');
update things set tags = array_remove(tags, 'Finland');
update things set tags = array_remove(tags, 'foundation');
update things set tags = array_remove(tags, 'freedom of expression');
update things set tags = array_remove(tags, 'freedom of speech');
update things set tags = array_remove(tags, 'Freerz');
update things set tags = array_remove(tags, 'Freerz Community');
update things set tags = array_remove(tags, 'Freerz Manifesto');
update things set tags = array_remove(tags, 'gamification');
update things set tags = array_remove(tags, 'global warming');
update things set tags = array_remove(tags, 'Government');
update things set tags = array_remove(tags, 'grassroots');
update things set tags = array_remove(tags, 'grassroots democracy');
update things set tags = array_remove(tags, 'health');
update things set tags = array_remove(tags, 'health care');
update things set tags = array_remove(tags, 'http://www.studycircles.net.au/');
update things set tags = array_remove(tags, 'ICT');
update things set tags = array_remove(tags, 'idea management');
update things set tags = array_remove(tags, 'IKEK');
update things set tags = array_remove(tags, 'india');
update things set tags = array_remove(tags, 'Initiative Process');
update things set tags = array_remove(tags, 'Inovacción ciudadana');
update things set tags = array_remove(tags, 'international education');
update things set tags = array_remove(tags, 'internet');
update things set tags = array_remove(tags, 'interplay');
update things set tags = array_remove(tags, '#IPDConf2018');
update things set tags = array_remove(tags, 'ISEK');
update things set tags = array_remove(tags, 'italia');
update things set tags = array_remove(tags, 'italy');
update things set tags = array_remove(tags, 'journalism');
update things set tags = array_remove(tags, 'languages');
update things set tags = array_remove(tags, 'large scale consultations');
update things set tags = array_remove(tags, 'Latin America');
update things set tags = array_remove(tags, 'law');
update things set tags = array_remove(tags, 'lawmaking');
update things set tags = array_remove(tags, 'law-making');
update things set tags = array_remove(tags, 'legal affairs');
update things set tags = array_remove(tags, 'legislative information');
update things set tags = array_remove(tags, 'local authority');
update things set tags = array_remove(tags, 'local economy');
update things set tags = array_remove(tags, 'local government');
update things set tags = array_remove(tags, 'local self-reliance');
update things set tags = array_remove(tags, 'Love');
update things set tags = array_remove(tags, 'media');
update things set tags = array_remove(tags, 'medicine');
update things set tags = array_remove(tags, 'meta-theory');
update things set tags = array_remove(tags, 'minorities');
update things set tags = array_remove(tags, 'mission humanitaire');
update things set tags = array_remove(tags, 'mission humanitaire afrique');
update things set tags = array_remove(tags, 'mockery');
update things set tags = array_remove(tags, 'money');
update things set tags = array_remove(tags, 'Movement');
update things set tags = array_remove(tags, 'MoveOn Move On');
update things set tags = array_remove(tags, 'nanotechnology');
update things set tags = array_remove(tags, 'net neutrality');
update things set tags = array_remove(tags, 'network');
update things set tags = array_remove(tags, 'NGO');
update things set tags = array_remove(tags, 'non-governmental');
update things set tags = array_remove(tags, 'Occupy');
update things set tags = array_remove(tags, 'Occupy Wall Street');
update things set tags = array_remove(tags, 'OCCUPY Wall Street');
update things set tags = array_remove(tags, 'Öffentlichkeitsbeteiligung');
update things set tags = array_remove(tags, 'open access');
update things set tags = array_remove(tags, 'open democracy');
update things set tags = array_remove(tags, 'open government');
update things set tags = array_remove(tags, 'Open Policy Making');
update things set tags = array_remove(tags, 'open space technology');
update things set tags = array_remove(tags, 'organization');
update things set tags = array_remove(tags, 'Pakistan');
update things set tags = array_remove(tags, 'parliamentary informatics');
update things set tags = array_remove(tags, 'partecipazione');
update things set tags = array_remove(tags, 'participación ciudadana');
update things set tags = array_remove(tags, 'participación comunitaria');
update things set tags = array_remove(tags, 'participation');
update things set tags = array_remove(tags, 'Participatory');
update things set tags = array_remove(tags, 'Participatory democracy');
update things set tags = array_remove(tags, 'particpatory democracy');
update things set tags = array_remove(tags, 'Partizipation');
update things set tags = array_remove(tags, 'patient-centred health care');
update things set tags = array_remove(tags, 'performance monitoring');
update things set tags = array_remove(tags, 'personality');
update things set tags = array_remove(tags, 'pirate parties');
update things set tags = array_remove(tags, 'planner');
update things set tags = array_remove(tags, 'platform');
update things set tags = array_remove(tags, 'police accountability');
update things set tags = array_remove(tags, 'policy development');
update things set tags = array_remove(tags, 'politics');
update things set tags = array_remove(tags, 'Portugal');
update things set tags = array_remove(tags, 'privacy');
update things set tags = array_remove(tags, 'procedural competencies');
update things set tags = array_remove(tags, 'Proces');
update things set tags = array_remove(tags, 'process designer');
update things set tags = array_remove(tags, 'processi decisionali inclusivi');
update things set tags = array_remove(tags, 'professional organization');
update things set tags = array_remove(tags, 'project Cycle management');
update things set tags = array_remove(tags, 'protest');
update things set tags = array_remove(tags, 'public education');
update things set tags = array_remove(tags, 'public engagement');
update things set tags = array_remove(tags, 'publicengmt');
update things set tags = array_remove(tags, 'Public Opinion');
update things set tags = array_remove(tags, 'public participation');
update things set tags = array_remove(tags, 'Radical Feminism');
update things set tags = array_remove(tags, 'regional authority');
update things set tags = array_remove(tags, 'republicanism');
update things set tags = array_remove(tags, 'responsabilità sociale');
update things set tags = array_remove(tags, 'reunion');
update things set tags = array_remove(tags, 'revolution');
update things set tags = array_remove(tags, 'Revoution');
update things set tags = array_remove(tags, 'science public engagement participation');
update things set tags = array_remove(tags, 'SDD');
update things set tags = array_remove(tags, 'service-learning');
update things set tags = array_remove(tags, 'shop local');
update things set tags = array_remove(tags, 'Shoreline Master Program SMP SMA Update');
update things set tags = array_remove(tags, 'small business');
update things set tags = array_remove(tags, 'social innovation');
update things set tags = array_remove(tags, 'social justice');
update things set tags = array_remove(tags, 'Social Justice');
update things set tags = array_remove(tags, 'social movement');
update things set tags = array_remove(tags, 'social research');
update things set tags = array_remove(tags, 'social ventures');
update things set tags = array_remove(tags, 'society');
update things set tags = array_remove(tags, 'sociocracy');
update things set tags = array_remove(tags, 'socio-economic research');
update things set tags = array_remove(tags, 'software');
update things set tags = array_remove(tags, 'Stadtplanung');
update things set tags = array_remove(tags, 'Statewide convener');
update things set tags = array_remove(tags, 'structured dialogic design');
update things set tags = array_remove(tags, 'stub');
update things set tags = array_remove(tags, 'student-led');
update things set tags = array_remove(tags, 'Super PAC');
update things set tags = array_remove(tags, 'sussidiarietà');
update things set tags = array_remove(tags, 'sweden');
update things set tags = array_remove(tags, 'Teaching Tool Student Engagement');
update things set tags = array_remove(tags, 'Technology');
update things set tags = array_remove(tags, 'temporary project syndicate');
update things set tags = array_remove(tags, 'theory on procedures');
update things set tags = array_remove(tags, 'toolbox');
update things set tags = array_remove(tags, 'toscana');
update things set tags = array_remove(tags, 'town council');
update things set tags = array_remove(tags, 'town meeting');
update things set tags = array_remove(tags, 'Tunisia');
update things set tags = array_remove(tags, 'tuscan');
update things set tags = array_remove(tags, 'tuscany');
update things set tags = array_remove(tags, 'Umbrella Group');
update things set tags = array_remove(tags, 'Unemployment');
update things set tags = array_remove(tags, 'Union');
update things set tags = array_remove(tags, 'US politics');
update things set tags = array_remove(tags, 'video');
update things set tags = array_remove(tags, 'voluntary');
update things set tags = array_remove(tags, 'Vote');
update things set tags = array_remove(tags, 'Voters');
update things set tags = array_remove(tags, 'Voting');
update things set tags = array_remove(tags, 'voting rights');
update things set tags = array_remove(tags, 'voyage humanitaire');
update things set tags = array_remove(tags, 'white supremacist');
update things set tags = array_remove(tags, 'wiki');
update things set tags = array_remove(tags, 'Wisdom Council');
update things set tags = array_remove(tags, 'wise democracy');
update things set tags = array_remove(tags, 'WWViews');
update things set tags = array_remove(tags, 'www.deborda.org');
update things set tags = array_remove(tags, 'young people community participation UK');
update things set tags = array_remove(tags, 'youth development');
update things set tags = array_remove(tags, '#youth #politics #civicengagement #canada');
update things set tags = array_remove(tags, '#youth #politics #civicengagement #kenya');

update things set tags = array_replace(tags, 'Accessibility', 'accessibility');
update things set tags = array_replace(tags, 'active citizens', 'activism');
update things set tags = array_replace(tags, 'Activism', 'activism');
update things set tags = array_replace(tags, 'Agenda Formation', 'agenda');
update things set tags = array_replace(tags, 'Agriculture', 'Agriculture');
update things set tags = array_replace(tags, 'Animal Protection & Welfare', 'animal');
update things set tags = array_replace(tags, 'Architect', 'architecture');
update things set tags = array_replace(tags, 'Architecture & Design', 'architecture');
update things set tags = array_replace(tags, 'arquitectura', 'architecture');
update things set tags = array_replace(tags, 'capacity building', 'capacity');
update things set tags = array_replace(tags, 'Capacity Building', 'capacity');
update things set tags = array_replace(tags, 'capacity planning', 'capacity');
update things set tags = array_replace(tags, 'civic engagement', 'civic_roles');
update things set tags = array_replace(tags, 'civic engagement digital participation planning public', 'civic_roles');
update things set tags = array_replace(tags, 'Civic Infrastructure', 'civic_infra');
update things set tags = array_replace(tags, 'civic participation', 'civic_roles');
update things set tags = array_replace(tags, 'Civic Roles & Powers', 'civic_roles');
update things set tags = array_replace(tags, 'civic studies', 'civic_roles');
update things set tags = array_replace(tags, 'civic tech', 'civic_infra');
update things set tags = array_replace(tags, 'Civil Infrastructure', 'civil');
update things set tags = array_replace(tags, 'civil society group', 'civil');
update things set tags = array_replace(tags, 'deliberative democracy', 'democratic');
update things set tags = array_replace(tags, 'democracy', 'democratic');
update things set tags = array_replace(tags, 'Democracy', 'democratic');
update things set tags = array_replace(tags, 'democratic accountability', 'democratic');
update things set tags = array_replace(tags, 'Democratic Experimentation', 'democratic');
update things set tags = array_replace(tags, 'Democratic Innovation', 'democratic');
update things set tags = array_replace(tags, 'Dialog Digital', 'dialogue');
update things set tags = array_replace(tags, 'dialogue', 'dialogue');
update things set tags = array_replace(tags, 'Dialogue & Deliberation', 'dialogue');
update things set tags = array_replace(tags, 'digital divide', 'digital');
update things set tags = array_replace(tags, 'digitalengagement', 'digital');
update things set tags = array_replace(tags, 'digital engagement', 'digital');
update things set tags = array_replace(tags, 'Digital/New Technologies', 'digital');
update things set tags = array_replace(tags, 'Direct Action', 'direct');
update things set tags = array_replace(tags, 'Direct Democracy', 'direct');
update things set tags = array_replace(tags, 'economic empowerment', 'empowerment');
update things set tags = array_replace(tags, 'education', 'educational');
update things set tags = array_replace(tags, 'Educational Resources & Opportunities', 'educational');
update things set tags = array_replace(tags, 'Empowerment', 'empowerment');
update things set tags = array_replace(tags, 'Environment', 'environment');
update things set tags = array_replace(tags, 'environmental conflicts', 'environment');
update things set tags = array_replace(tags, 'environmental impact assessment studies', 'environment');
update things set tags = array_replace(tags, 'environmental justice', 'environment');
update things set tags = array_replace(tags, 'Environmental Justice', 'environment');
update things set tags = array_replace(tags, 'Formal/Structured Participation', 'formal');
update things set tags = array_replace(tags, 'Gender', 'gender');
update things set tags = array_replace(tags, 'Global Affairs', 'global');
update things set tags = array_replace(tags, 'Human Rights', 'human');
update things set tags = array_replace(tags, 'Inclusive', 'inclusiveness');
update things set tags = array_replace(tags, 'inclusive decision making', 'inclusiveness');
update things set tags = array_replace(tags, 'Inclusiveness (from DemocracySpot)', 'inclusiveness');
update things set tags = array_replace(tags, 'Inclussiveness', 'inclusiveness');
update things set tags = array_replace(tags, 'indigenous', 'indigenous');
update things set tags = array_replace(tags, 'Indigenous Issues', 'indigenous');
update things set tags = array_replace(tags, 'Informal Participation', 'informal');
update things set tags = array_replace(tags, 'Internal- & Self-Management', 'internal');
update things set tags = array_replace(tags, 'Mapping & Analysis', 'mapping');
update things set tags = array_replace(tags, 'maps', 'mapping');
update things set tags = array_replace(tags, 'online', 'online');
update things set tags = array_replace(tags, 'Online', 'online');
update things set tags = array_replace(tags, 'online deliberation', 'online');
update things set tags = array_replace(tags, 'Online Democracy', 'online');
update things set tags = array_replace(tags, 'online discussion', 'online');
update things set tags = array_replace(tags, 'online forum', 'online');
update things set tags = array_replace(tags, 'Oversight & Monitoring', 'oversight');
update things set tags = array_replace(tags, 'participatory budget', 'participatory');
update things set tags = array_replace(tags, 'participatory budgeting', 'participatory');
update things set tags = array_replace(tags, 'Participatory Budgeting', 'participatory');
update things set tags = array_replace(tags, 'Planning & Development', 'planning');
update things set tags = array_replace(tags, 'Political Institutions', 'political');
update things set tags = array_replace(tags, 'public consultation', 'public_opinion');
update things set tags = array_replace(tags, 'Public Services', 'public_services');
update things set tags = array_replace(tags, 'Race', 'race');
update things set tags = array_replace(tags, 'racism', 'race');
update things set tags = array_replace(tags, 'research', 'research');
update things set tags = array_replace(tags, 'Research/Study', 'research');
update things set tags = array_replace(tags, 'Rural', 'rural');
update things set tags = array_replace(tags, 'Science Communication', 'science');
update things set tags = array_replace(tags, 'Social Media', 'social_media');
update things set tags = array_replace(tags, 'Social Welfare', 'social_welfare');
update things set tags = array_replace(tags, 'stakeholder engagement', 'stakeholder');
update things set tags = array_replace(tags, 'Stakeholder Engagement', 'stakeholder');
update things set tags = array_replace(tags, 'Storytelling', 'storytelling');
update things set tags = array_replace(tags, 'sustainability', 'sustainability');
update things set tags = array_replace(tags, 'Sustainability & Green Living', 'sustainability');
update things set tags = array_replace(tags, 'Transparency & Accountability', 'transparency');
update things set tags = array_replace(tags, 'Urban', 'urban');
update things set tags = array_replace(tags, 'urban politics', 'urban');
update things set tags = array_replace(tags, 'youth', 'youth');
update things set tags = array_replace(tags, 'youth engagement', 'youth');
update things set tags = array_replace(tags, 'Youth Participation', 'youth');
update things set tags = array_replace(tags, 'Youth & Student Engagement', 'youth');
update things set tags = array_replace(tags, 'Youth & Student Engagment', 'youth');
update things set tags = array_replace(tags, 'children', 'youth');
