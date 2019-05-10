const methodTypes = [
  {
    key: "collaborative",
    value: "Collaborative approaches",
    longValue:
      "Collaborative approaches (i.e. two or more stakeholders work together to address a common problem)"
  },
  {
    key: "community",
    value: "Community development, organizing, and mobilization",
    longValue:
      "Community development, organizing, and mobilization (i.e. empowering communities to drive, implement, and effect change)"
  },
  {
    key: "deliberative",
    value: "Deliberative and dialogic process",
    longValue:
      "Deliberative and dialogic process (i.e. structured processes that involve deliberation and/or dialogue as a central aspect)"
  },
  {
    key: "direct",
    value: "Direct democracy",
    longValue:
      "Direct democracy (i.e. formal processes by which citizens exert direct authority over decisions)"
  },
  {
    key: "evaluation",
    value: "Evaluation, oversight, and social auditing",
    longValue:
      "Evaluation, oversight, and social auditing (i.e.monitoring public bodies and services to hold officials and authorities to account)"
  },
  {
    key: "experiential",
    value: "Experiential and immersive education",
    longValue:
      "Experiential and immersive education (i.e. alternative approaches to teaching and learning) "
  },
  {
    key: "informal",
    value: "Informal conversation spaces",
    longValue:
      "Informal conversation spaces (i.e. spaces where deliberation and discussion may take place in an informal or unstructured way)"
  },
  {
    key: "informal_participation",
    value: "Informal participation",
    longValue:
      "Informal participation (i.e. extra-institutional attempts to secure access to resources, rights and political representation without using formal governmental channels)"
  },
  {
    key: "internal",
    value: "Internal management or organization",
    longValue:
      "Internal management or organization (i.e. systems of internal communication, representation, or decision-making)"
  },
  {
    key: "longterm",
    value: "Long-term civic bodies",
    longValue:
      "Long-term civic bodies (i.e. sustained efforts to provide the public with opportunities for input and decision-making, typically at the local level)"
  },
  {
    key: "participantled",
    value: "Participant-led meetings",
    longValue:
      "Participant-led meetings (i.e. participants shape the agenda and process)"
  },
  {
    key: "participatory",
    value: "Participatory arts",
    longValue:
      "Participatory arts (i.e. processes that engage audiences as participants in the artistic  production or endeavour)"
  },
  {
    key: "planning",
    value: "Planning",
    longValue:
      "Planning (i.e. comprehensive approaches to establish goals, policies, and procedures for a social or governmental unit)"
  },
  {
    key: "protest",
    value: "Protest",
    longValue:
      "Protest (i.e. direct confrontation with public and/or private institutions)"
  },
  {
    key: "public",
    value: "Public budgeting",
    longValue:
      "Public budgeting (i.e. designed to help decide how public funds should be spent)"
  },
  {
    key: "public_meetings",
    value: "Public meetings",
    longValue:
      "Public meetings (i.e. government-sponsored meetings open to the general public where public officials may also be present)"
  },
  {
    key: "research",
    value: "Research or experimental method",
    longValue:
      "Research or experimental method (i.e. forms of academic research, or participatory approaches tested as part of a research project)"
  }
];

const toolsTechniquesTypes = [
  {
    key: "manage",
    value: "Manage and/or allocate money or resources",
    longValue:
      "Manage and/or allocate money or resources (e.g. mobile budgeting applications)"
  },
  {
    key: "collect",
    value: "Collect, analyse and/or solicit feedback",
    longValue:
      "Collect, analyze, and/or solicit feedback (e.g. questionnaire; keypad polling)"
  },
  {
    key: "facilitate",
    value: "Facilitate dialogue, discussion, and/or deliberation",
    longValue:
      "Facilitate dialogue, discussion, and/or deliberation (e.g. active listening; managing conflict)"
  },
  {
    key: "facilitate_decisionmaking",
    value: "Facilitate decision-making",
    longValue: "Facilitate decision-making (e.g. ranking; multi-voting)"
  },
  {
    key: "legislation",
    value: "Legislation, policy, or frameworks",
    longValue:
      "Legislation, policy, or frameworks (e.g. arrangements that formally embed public participation)"
  },
  {
    key: "recruit",
    value: "Recruit or select participants",
    longValue:
      "Recruit or select participants (e.g. community outreach; random selection)"
  },
  {
    key: "plan",
    value: "Plan, map and/or visualise options and proposals",
    longValue:
      "Plan, map and/or visualize options and proposals (e.g.GIS mapping)"
  },
  {
    key: "propose",
    value: "Propose and/or develop policies, ideas, and recommendations",
    longValue:
      "Propose and/or develop policies, ideas, and recommendations (e.g. brainstorming; nominal group technique)"
  },
  {
    key: "inform",
    value: "Inform, educate and/or raise awareness",
    longValue:
      "Inform, educate and/or raise awareness (e.g. discussion guide; Q&A with experts)"
  }
];

module.exports = {
  general_issues: [
    {
      key: "agriculture",
      value: "Agriculture, Forestry, Fishing & Mining Industries"
    },
    { key: "arts", value: "Arts, Culture, & Recreation" },
    { key: "business", value: "Business" },
    { key: "economics", value: "Economics" },
    { key: "education", value: "Education" },
    { key: "energy", value: "Energy" },
    { key: "environment", value: "Environment" },
    {
      key: "governance",
      value: "Governance & Political Institutions",
      longValue:
        "Governance & Political Institutions (e.g. constitutions, legal systems, electoral systems)"
    },
    { key: "health", value: "Health" },
    { key: "housing", value: "Housing" },
    { key: "human", value: "Human Rights & Civil Rights" },
    { key: "identity", value: "Identity & Diversity" },
    { key: "immigration", value: "Immigration & Migration" },
    { key: "international", value: "International Affairs" },
    { key: "labor", value: "Labor & Work" },
    { key: "law", value: "Law Enforcement, Criminal Justice & Corrections" },
    { key: "media", value: "Media, Telecommunications & Information" },
    { key: "national", value: "National Security" },
    { key: "planning", value: "Planning & Development" },
    { key: "science", value: "Science & Technology" },
    { key: "social", value: "Social Welfare" },
    { key: "transportation", value: "Transportation" }
  ],
  specific_topics: [
    { key: "abilitydisability", value: "Ability/Disability Issues" },
    { key: "abortion", value: "Abortion" },
    { key: "access", value: "Access to Radio & Television Frequencies" },
    { key: "addiction", value: "Addiction Treatment & Management" },
    {
      key: "administration",
      value: "Administration of Campaigns and Elections"
    },
    { key: "affordable", value: "Affordable Housing" },
    { key: "age", value: "Age Discrimination" },
    { key: "aging", value: "Aging" },
    { key: "aging_issues", value: "Aging Issues" },
    { key: "agricultural", value: "Agricultural Biotechnology" },
    { key: "air", value: "Air Quality" },
    { key: "air_travel", value: "Air Travel" },
    { key: "alternative", value: "Alternative & Renewable Energy" },
    { key: "alternative_education", value: "Alternative Education" },
    { key: "animal", value: "Animal Welfare" },
    { key: "arms", value: "Arms Control" },
    { key: "artificial", value: "Artificial Intelligence" },
    { key: "bankruptcy", value: "Bankruptcy" },
    { key: "biomedical", value: "Biomedical Research & Development" },
    { key: "birth", value: "Birth Control" },
    { key: "budget", value: "Budget - Local" },
    { key: "budget_national", value: "Budget - National" },
    { key: "budget_provincial", value: "Budget - Provincial, Regional, State" },
    { key: "bureaucracy", value: "Bureaucracy" },
    { key: "carbon", value: "Carbon Capture & Sequestration" },
    { key: "censorship", value: "Censorship" },
    { key: "child", value: "Child Care" },
    { key: "citizenship", value: "Citizenship & Role of Citizens" },
    { key: "civil", value: "Civil Law" },
    { key: "climate", value: "Climate Change" },
    { key: "coal", value: "Coal" },
    { key: "cohousing", value: "Cohousing" },
    { key: "community", value: "Community & Police Relations" },
    { key: "community_resettlement", value: "Community Resettlement" },
    { key: "concentration", value: "Concentration of Media Ownership" },
    { key: "constitutional", value: "Constitutional Reform" },
    { key: "consumer", value: "Consumer Protection" },
    { key: "copyrights", value: "Copyrights & Patents" },
    { key: "corporate", value: "Corporate Subsidies" },
    { key: "court", value: "Court Systems" },
    { key: "criminal", value: "Criminal Law" },
    { key: "cultural", value: "Cultural Assimilation or Integration" },
    { key: "curriculum", value: "Curriculum & Standards" },
    { key: "cyber", value: "Cyber Security" },
    { key: "cycling", value: "Cycling" },
    { key: "diplomacy", value: "Diplomacy" },
    { key: "disability", value: "Disability Rights" },
    { key: "disabled", value: "Disabled Assistance" },
    { key: "disaster", value: "Disaster Preparedness" },
    { key: "disease", value: "Disease Prevention" },
    { key: "drug", value: "Drug Coverage & Cost" },
    { key: "drug_testing", value: "Drug Testing & Regulation" },
    { key: "early", value: "Early Childhood Education" },
    { key: "ecohousing", value: "Eco-Housing" },
    { key: "economic", value: "Economic Development" },
    { key: "economic_inequality", value: "Economic Inequality" },
    { key: "elderly", value: "Elderly Assistance" },
    { key: "elderly_housing", value: "Elderly Housing" },
    { key: "electricity", value: "Electricity" },
    { key: "elementary", value: "Elementary & Secondary Education" },
    { key: "employee", value: "Employee Benefits" },
    { key: "energy", value: "Energy Conservation" },
    { key: "energy_efficiency", value: "Energy Efficiency & Storage" },
    { key: "energy_siting", value: "Energy Siting & Transmission" },
    { key: "environmental", value: "Environmental Conservation" },
    { key: "ethnicracial", value: "Ethnic/Racial Equality & Equity" },
    { key: "ethnicracial_relations", value: "Ethnic/Racial Relations" },
    { key: "fair", value: "Fair Labor Standards" },
    { key: "financing", value: "Financing of Political Campaigns" },
    { key: "fisheries", value: "Fisheries & Fishing" },
    { key: "food", value: "Food & Nutrition" },
    { key: "food_assistance", value: "Food Assistance" },
    { key: "food_inspection", value: "Food Inspection & Safety" },
    { key: "foreign", value: "Foreign Aid" },
    { key: "freedom", value: "Freedom of Information" },
    { key: "freedom_of", value: "Freedom of Speech" },
    { key: "funding", value: "Funding" },
    { key: "gender", value: "Gender Equality & Equity" },
    { key: "gender_identity", value: "Gender Identity" },
    { key: "geopolitics", value: "Geopolitics" },
    { key: "geotechnology", value: "Geotechnology" },
    { key: "government", value: "Government Corruption" },
    { key: "government_funding", value: "Government Funding of Education" },
    { key: "government_spending", value: "Government Spending" },
    { key: "government_subsidies", value: "Government Subsidies" },
    { key: "government_transparency", value: "Government Transparency" },
    { key: "hazardous", value: "Hazardous Waste" },
    { key: "health", value: "Health Care Reform" },
    { key: "health_insurance", value: "Health Insurance" },
    { key: "higher", value: "Higher Education" },
    { key: "highway", value: "Highway Safety" },
    { key: "homelessness", value: "Homelessness" },
    { key: "housing", value: "Housing Planning" },
    { key: "human", value: "Human Rights" },
    { key: "human_trafficking", value: "Human Trafficking" },
    { key: "identity", value: "Identity Politics" },
    { key: "immigration", value: "Immigration" },
    { key: "indigenous", value: "Indigenous Issues" },
    { key: "indigenous_planning", value: "Indigenous Planning" },
    { key: "industrial", value: "Industrial Policy" },
    { key: "industrial_siting", value: "Industrial Siting Guidelines" },
    { key: "information", value: "Information & Communications Technology" },
    { key: "infrastructure", value: "Infrastructure" },
    { key: "intellectual", value: "Intellectual Property Rights" },
    { key: "intelligence", value: "Intelligence Gathering" },
    { key: "intergovernmental", value: "Intergovernmental Relations" },
    { key: "international", value: "International Law" },
    { key: "internet", value: "Internet Access" },
    { key: "internet_governance", value: "Internet Governance" },
    { key: "jails", value: "Jails and Prisons" },
    { key: "judicial", value: "Judicial Reform" },
    { key: "labor", value: "Labor Unions" },
    { key: "land", value: "Land Use" },
    { key: "lgbtq", value: "LGBTQ Issues" },
    { key: "libraries", value: "Libraries" },
    { key: "longterm", value: "Long-Term Care" },
    { key: "lowincome", value: "Low-income Assistance" },
    { key: "maritime", value: "Maritime" },
    { key: "masspublic", value: "Mass/Public Transport" },
    { key: "medical", value: "Medical Liability" },
    { key: "mental", value: "Mental Health" },
    { key: "migrant", value: "Migrant and Seasonal Labor" },
    { key: "military", value: "Military and Defense" },
    { key: "monetary", value: "Monetary Policy" },
    { key: "museums", value: "Museums" },
    { key: "nanotechnology", value: "Nanotechnology" },
    { key: "natural", value: "Natural Gas & Oil" },
    { key: "natural_resource", value: "Natural Resource Management" },
    { key: "nuclear", value: "Nuclear Energy" },
    { key: "open", value: "Open Data" },
    { key: "pensions", value: "Pensions & Retirement" },
    { key: "police", value: "Police" },
    { key: "political", value: "Political Parties" },
    { key: "political_rights", value: "Political Rights" },
    { key: "poverty", value: "Poverty" },
    { key: "public", value: "Public Amenities" },
    { key: "public_art", value: "Public Art" },
    { key: "public_participation", value: "Public Participation" },
    { key: "public_safety", value: "Public Safety" },
    { key: "quality", value: "Quality of Health Care" },
    { key: "railroads", value: "Railroads" },
    { key: "recycling", value: "Recycling" },
    { key: "refugee", value: "Refugee Resettlement" },
    { key: "refugee_rights", value: "Refugee Rights" },
    { key: "regional", value: "Regional & Global Governance" },
    { key: "regionalism", value: "Regionalism" },
    { key: "regulation", value: "Regulation" },
    { key: "regulatory", value: "Regulatory Policy" },
    { key: "religious", value: "Religious Rights" },
    { key: "research", value: "Research & Development" },
    { key: "resilience", value: "Resilience Planning & Design" },
    { key: "right", value: "Right to Adequate Housing" },
    { key: "right_to", value: "Right to Representation" },
    { key: "roads", value: "Roads and Highways" },
    { key: "rural", value: "Rural Housing" },
    { key: "school", value: "School Governance" },
    { key: "selfdriving", value: "Self-Driving Vehicles" },
    { key: "sentencing", value: "Sentencing Guidelines" },
    { key: "social", value: "Social Determinants of Health" },
    { key: "space", value: "Space Exploration" },
    { key: "special", value: "Special Education" },
    { key: "species", value: "Species Protection" },
    { key: "sports", value: "Sports" },
    { key: "substance", value: "Substance Abuse" },
    { key: "sustainable", value: "Sustainable Development" },
    { key: "taxation", value: "Taxation" },
    { key: "teacher", value: "Teacher Training & Accountability" },
    { key: "telephone", value: "Telephone Access" },
    { key: "terrorism", value: "Terrorism" },
    { key: "torture", value: "Torture" },
    { key: "tourism", value: "Tourism" },
    { key: "trade", value: "Trade and Tariffs" },
    { key: "transparency", value: "Transparency" },
    { key: "transportation", value: "Transportation Planning" },
    { key: "treaties", value: "Treaties" },
    { key: "unemployment", value: "Unemployment" },
    { key: "unofficial", value: "Unofficial (Track II) Diplomacy" },
    { key: "vocational", value: "Vocational Education & Training" },
    { key: "wage", value: "Wage Standards" },
    { key: "walkingpedestrian", value: "Walking/Pedestrian Mobility" },
    { key: "waste", value: "Waste Disposal" },
    { key: "water", value: "Water Quality" },
    { key: "weather", value: "Weather Forecasting" },
    { key: "wilderness", value: "Wilderness Protection" },
    { key: "worker", value: "Worker Health & Safety" },
    { key: "workforce", value: "Workforce Education" },
    { key: "youth", value: "Youth Employment" },
    { key: "youth_issues", value: "Youth Issues" }
  ],
  facetoface_online_or_both: [
    { key: "facetoface", value: "Face-to-Face" },
    { key: "online", value: "Online" },
    { key: "both", value: "Both" }
  ],
  type_method: methodTypes,
  method_types: methodTypes,
  purposes: [
    {
      key: "make",
      value:
        "Make, influence, or challenge decisions of government and public bodies"
    },
    {
      key: "make_influence",
      value: "Make, influence, or challenge decisions of private organizations",
      longValue:
        "Make, influence, or challenge decisions of private organizations (e.g., civil society organizations; corporations)"
    },
    {
      key: "deliver",
      value: "Deliver goods & services",
      longValue:
        "Deliver goods and services (e.g., co-production of public safety by police and community)"
    },
    {
      key: "develop",
      value:
        "Develop the civic capacities of individuals, communities, and/or civil society organizations",
      longValue:
        "Develop the civic capacities of individuals, communities, and/or civil society organizations (e.g., increase understanding of public issues; strengthen social capital)"
    },
    { key: "academic", value: "Research" }
  ],
  public_spectrum: [
    {
      key: "inform",
      value: "Inform",
      longValue:
        "Inform (provide the public with balanced and objective information to assist in understanding the problem, alternatives, opportunities, and/or solutions)"
    },
    {
      key: "consult",
      value: "Consult",
      longValue:
        "Consult (obtain feedback on analyses, alternatives, and/or decisions)"
    },
    {
      key: "involve",
      value: "Involve",
      longValue:
        "Involve (work directly with the public throughout the process to ensure that public concerns are understood & considered)"
    },
    {
      key: "collaborate",
      value: "Collaborate",
      longValue:
        "Collaborate (partner with the public in each aspect of the decision including the development of alternatives & the identification of the preferred solution)"
    },
    {
      key: "empower",
      value: "Empower",
      longValue:
        "Empower (place final decision-making in the hands of the public)"
    },
    { key: "not", value: "Not applicable or not relevant" }
  ],
  scope_of_influence: [
    {
      key: "organization",
      value: "Organization",
      longValue:
        "Organization (e.g. a local business or cooperative using participatory methods to manage and govern itself)"
    },
    { key: "neighbourhood", value: "Neighbourhood" },
    { key: "city/town", value: "City/Town" },
    { key: "metropolitan", value: "Metropolitan Area" },
    {
      key: "regional",
      value: "Regional",
      longValue: "Regional (e.g. State, Province, Autonomous Region)"
    },
    { key: "national", value: "National" },
    { key: "multinational", value: "Multinational" },
    {
      key: "no_geo",
      value: "No Geographical Limits",
      longValue:
        "No Geographical Limits (e.g. online environment where anyone from any place can take part)"
    }
  ],
  legality: [{ key: "yes", value: "Yes" }, { key: "no", value: "No" }],
  staff: [{ key: "yes", value: "Yes" }, { key: "no", value: "No" }],
  volunteers: [{ key: "yes", value: "Yes" }, { key: "no", value: "No" }],
  impact_evidence: [{ key: "yes", value: "Yes" }, { key: "no", value: "No" }],
  formal_evaluation: [{ key: "yes", value: "Yes" }, { key: "no", value: "No" }],
  facilitators: [
    { key: "yes", value: "Yes" },
    { key: "no", value: "No" },
    { key: "not_applicable", value: "Not applicable" }
  ],

  decision_methods: [
    {
      key: "opinion",
      value: "Opinion Survey",
      longValue:
        "Opinion Survey (i.e. taken before and/or after participants convened)"
    },
    {
      key: "idea",
      value: "Idea Generation",
      longValue:
        "Idea Generation (i.e. potential solutions were generated, but no priorities were decided)"
    },
    {
      key: "general",
      value: "General Agreement/Consensus",
      longValue:
        "General Agreement/Consensus (i.e. broad acceptance of decisions; unanimous agreement desired but not necessary)"
    },
    {
      key: "voting",
      value: "Voting",
      longValue:
        "Voting (i.e. any type of formal vote; please provide more detail in next field)"
    },
    {
      key: "n/a",
      value: "Not Applicable",
      longValue:
        "Not Applicable (e.g. votes are not typically taken at protest demonstrations)"
    },
    { key: "dont", value: "Don’t Know" }
  ],
  tags: [
    { key: "accessibility", value: "Accessibility" },
    { key: "activism", value: "Activism" },
    { key: "agenda", value: "Agenda Formation" },
    { key: "animal", value: "Animal Protection & Welfare" },
    { key: "architecture", value: "Architecture & Design" },
    { key: "capacity", value: "Capacity Building" },
    { key: "civic_infra", value: "Civic Infrastructure" },
    { key: "civic_roles", value: "Civic Roles & Powers" },
    { key: "civil", value: "Civil Infrastructure" },
    { key: "conflict", value: "Conflict Resolution" },
    { key: "decision", value: "Decision-Making" },
    { key: "democratic", value: "Democratic Innovation" },
    { key: "dialogue", value: "Dialogue & Deliberation" },
    { key: "digital", value: "Digital/New Technologies" },
    { key: "direct", value: "Direct Action" },
    { key: "educational", value: "Educational Resources & Opportunities" },
    { key: "empowerment", value: "Empowerment" },
    { key: "environment", value: "Environment" },
    { key: "formal", value: "Formal/Structured Participation" },
    { key: "gender", value: "Gender" },
    { key: "global", value: "Global Affairs" },
    { key: "human", value: "Human Rights" },
    { key: "inclusiveness", value: "Inclusiveness" },
    { key: "indigenous", value: "Indigenous Issues" },
    { key: "informal", value: "Informal Participation" },
    { key: "initiative", value: "Initiative Process" },
    { key: "internal", value: "Internal- & Self-Management" },
    { key: "mapping", value: "Mapping & Analysis" },
    { key: "online", value: "Online" },
    { key: "oversight", value: "Oversight & Monitoring" },
    { key: "participatory", value: "Participatory Budgeting" },
    { key: "planning", value: "Planning & Development" },
    { key: "political", value: "Political Institutions" },
    { key: "public_opinion", value: "Public Opinion" },
    { key: "public_services", value: "Public Services" },
    { key: "race", value: "Race" },
    { key: "research", value: "Research/Study" },
    { key: "rural", value: "Rural" },
    { key: "science", value: "Science Communication" },
    { key: "social_media", value: "Social Media" },
    { key: "social_welfare", value: "Social Welfare" },
    { key: "stateholder", value: "Stakeholder Engagement" },
    { key: "storytelling", value: "Storytelling" },
    { key: "sustainability", value: "Sustainability & Green Living" },
    { key: "transparency", value: "Transparency & Accountability" },
    { key: "urban", value: "Urban" },
    { key: "youth", value: "Youth & Student Engagement" }
  ],
  time_limited: [
    { key: "a", value: "A single, defined period of time" },
    { key: "repeated", value: "Repeated over time" }
  ],
  approaches: [
    {
      key: "advocacy",
      value: "Advocacy",
      longValue: "Advocacy (e.g. lobbying; petitioning)"
    },
    {
      key: "citizenship",
      value: "Citizenship building",
      longValue:
        "Citizenship building (e.g. opportunities for people to learn about their rights & claim them)"
    },
    {
      key: "civil",
      value: "Civil society building",
      longValue:
        "Civil society building (e.g. network building across governmental & social boundaries)"
    },
    {
      key: "cogovernance",
      value: "Co-governance",
      longValue:
        "Co-governance (e.g. collaboration in decision making with government and public bodies)"
    },
    {
      key: "coproduction",
      value:
        "Co-production in form of partnership and/or contract with government and/or public bodies",
      longValue:
        "Co-production in form of partnership and/or contract with government and/or public bodies (e.g. collaboration with government to provide affordable housing)"
    },
    {
      key: "coproduction_form",
      value:
        "Co-production in form of partnership and/or contract with private organisations",
      longValue:
        "Co-production in form of partnership and/or contract with private organisations (e.g. collaboration with business or civil society)"
    },
    {
      key: "consultation",
      value: "Consultation",
      longValue: "Consultation (e.g. public hearings)"
    },
    {
      key: "direct",
      value: "Direct decision making",
      longValue: "Direct decision making (e.g. referenda)"
    },
    {
      key: "independent",
      value: "Independent action",
      longValue:
        "Independent action (without the participation of government or private bodies)"
    },
    {
      key: "informal",
      value:
        "Informal engagement by intermediaries with nongovernmental authorities",
      longValue:
        "Informal engagement by intermediaries with nongovernmental authorities (e.g. bargaining & negotiation on behalf of marginalized sectors)"
    },
    {
      key: "informal_engagement",
      value: "Informal engagement by intermediaries with political authorities",
      longValue:
        "Informal engagement by intermediaries with political authorities (e.g. bargaining & negotiation on behalf of marginalized sectors)"
    },
    {
      key: "leadership",
      value: "Leadership development",
      longValue:
        "Leadership development (e.g. individual & group capacity for civic engagement)"
    },
    {
      key: "evaluation",
      value: "Evaluation, oversight, & social auditing",
      longValue:
        "Evaluation, oversight, & social auditing (e.g. measuring & reporting organizational performance)"
    },
    {
      key: "protest",
      value: "Protest",
      longValue: "Protest (e.g. demonstrations; marches; pickets) "
    },
    {
      key: "research",
      value: "Research",
      longValue:
        "Research (e.g., public opinion surveys; focus groups; participatory action research)"
    },
    {
      key: "social",
      value: "Social mobilization",
      longValue:
        "Social mobilization (e.g. community organizing; consciousness raising; political consumerism) "
    }
  ],
  open_limited: [
    { key: "open", value: "Open to All" },
    {
      key: "open_to",
      value: "Open to All With Special Effort to Recruit Some Groups",
      longValue:
        "Open to All With Special Effort to Recruit Some Groups (e.g. community organizing to recruit low-income earners)"
    },
    { key: "limited", value: "Limited to Only Some Groups or Individuals" },
    {
      key: "both",
      value: "mixed",
      longValue:
        "Mixed (i.e. some aspects are open to all and others are limited to some)"
    }
  ],
  recruitment_method: [
    { key: "captive", value: "Captive Sample" },
    { key: "random", value: "Random Sample" },
    { key: "stratified", value: "Stratified Random Sample" },
    { key: "appointment", value: "Appointment" },
    { key: "election", value: "Election" },
    { key: "not", value: "Not Applicables" }
  ],
  targeted_participants: [
    {
      key: "appointed",
      value: "Appointed Public Servants",
      longValue: "Appointed Public Servants (e.g. bureaucrats)"
    },
    {
      key: "lgbt",
      value: "Lesbian/Gay/Bisexual/Transgender",
      longValue: "Lesbian/Gay/Bisexual/Transgender (i.e. LGBT)"
    },
    { key: "elderly", value: "Elderly" },
    { key: "elected", value: "Elected Public Officials" },
    {
      key: "experts",
      value: "Experts",
      longValue: "Experts (e.g. scientists)"
    },
    { key: "indigenous", value: "Indigenous People" },
    { key: "immigrants", value: "Immigrants" },
    { key: "lowincome", value: "Low-Income Earners" },
    { key: "men", value: "Men" },
    { key: "people", value: "People with Disabilities" },
    { key: "racialethnic", value: "Racial/Ethnic Groups" },
    { key: "religious", value: "Religious Groups" },
    {
      key: "stakeholder",
      value: "Stakeholder Organizations",
      longValue: "Stakeholder Organizations (e.g. NGOs, business interests)"
    },
    { key: "students", value: "Students" },
    { key: "women", value: "Women" },
    { key: "youth", value: "Youth" }
  ],
  tools_techniques_types: toolsTechniquesTypes,
  type_tool: toolsTechniquesTypes,
  facilitator_training: [
    { key: "professional", value: "Professional Facilitators" },
    { key: "trained", value: "Trained, Nonprofessional Facilitators" },
    { key: "untrained", value: "Untrained, Nonprofessional Facilitators" }
  ],
  participants_interactions: [
    { key: "acting", value: "Acting, Drama, or Roleplay" },
    { key: "ask", value: "Ask & Answer Questions" },
    { key: "discussion", value: "Discussion, Dialogue, or Deliberation" },
    { key: "express", value: "Express Opinions/Preferences Only" },
    { key: "formal", value: "Formal Testimony" },
    { key: "informal", value: "Informal Social Activities" },
    { key: "listenwatch", value: "Listen/Watch as Spectator" },
    { key: "negotiation", value: "Negotiation & Bargaining" },
    { key: "storytelling", value: "Storytelling" },
    { key: "teachinginstructing", value: "Teaching/Instructing" },
    { key: "no_interaction", value: "No Interaction Among Participants" }
  ],
  learning_resources: [
    { key: "expert", value: "Expert Presentations" },
    { key: "participant", value: "Participant Presentations" },
    { key: "site", value: "Site Visits" },
    { key: "teachins", value: "Teach-ins" },
    {
      key: "video",
      value: "Video Presentations",
      longValue: "Video Presentations (online or in-person)"
    },
    {
      key: "written",
      value: "Written Briefing Materials",
      longValue: "Written Briefing Materials (online or as handouts)"
    },
    { key: "no_info", value: "No Information Was Provided to Participants" },
    { key: "not", value: "Not Relevant to this Type of Initiative" }
  ],
  if_voting: [
    {
      key: "preferential",
      value: "Preferential Voting",
      longValue: "Preferential Voting (i.e. ranked preferences)"
    },
    {
      key: "plurality",
      value: "Plurality",
      longValue:
        "Plurality (i.e. highest percentage wins, even if the proposal receives fewer than 50.1% votes)"
    },
    {
      key: "majoritarian",
      value: "Majoritarian Voting",
      longValue: "Majoritarian Voting (i.e. 50% +1)"
    },
    {
      key: "supermajoritarian",
      value: "Super-Majoritarian",
      longValue: "Super-Majoritarian (i.e. threshold more than 50% +1)"
    },
    {
      key: "unanimous",
      value: "Unanimous Decision",
      longValue: "Unanimous Decision (i.e. full agreement by all participants)"
    },
    { key: "dont", value: "Don’t Know" }
  ],
  insights_outcomes: [
    {
      key: "artistic",
      value: "Artistic Expression",
      longValue: "Artistic Expression (e.g. political rap, street theater)"
    },
    {
      key: "traditional",
      value: "Traditional Media",
      longValue: "Traditional Media (i.e. television, radio, newspapers)"
    },
    {
      key: "new",
      value: "New Media",
      longValue: "New Media (e.g. social media, blogging, texting)"
    },
    {
      key: "independent",
      value: "Independent Media",
      longValue:
        "Independent Media (i.e. free of corporate or government influence)"
    },
    { key: "public", value: "Public Report" },
    {
      key: "minority",
      value: "Minority Report",
      longValue: "Minority Report (i.e. a dissenting opinion)"
    },
    { key: "petitions", value: "Petitions" },
    { key: "protestspublic", value: "Protests/Public Demonstrations" },
    { key: "public_hearingsmeetings", value: "Public Hearings/Meetings" },
    { key: "word", value: "Word of Mouth" },
    { key: "n/a", value: "Not Applicable" }
  ],
  organizer_types: [
    { key: "academic", value: "Academic Institution" },
    { key: "activist", value: "Activist Network" },
    { key: "community", value: "Community Based Organization" },
    { key: "faithbased", value: "Faith-Based Organization" },
    { key: "forprofit", value: "For-Profit Business" },
    { key: "governmentowned", value: "Government-Owned Corporation" },
    { key: "individual", value: "Individual" },
    { key: "international", value: "International Organization" },
    {
      key: "local",
      value: "Local Government",
      longValue: "Local Government (e.g. Village, Town, City)"
    },
    { key: "national", value: "National Government" },
    {
      key: "nongovernmental",
      value: "Non-Governmental Organization",
      longValue: "Non-Governmental Organization (Non-profit)"
    },
    {
      key: "philanthropic",
      value: "Philanthropic Organization",
      longValue:
        "Philanthropic Organization (i.e. dedicated to making monetary grants or gifts)"
    },
    {
      key: "regional",
      value: "Regional Government",
      longValue: "Regional Government (e.g. State, Provincial, Territorial)"
    },
    { key: "social", value: "Social Movement" },
    { key: "labortrade", value: "Labor/Trade Union" },
    { key: "n/a", value: "Not Applicable" }
  ],
  funder_types: [
    { key: "academic", value: "Academic Institution" },
    { key: "activist", value: "Activist Network" },
    { key: "community", value: "Community Based Organization" },
    { key: "faithbased", value: "Faith-Based Organization" },
    { key: "forprofit", value: "For-Profit Business" },
    { key: "governmentowned", value: "Government-Owned Corporation" },
    { key: "individual", value: "Individual" },
    { key: "international", value: "International Organization" },
    {
      key: "local",
      value: "Local Government",
      longValue: "Local Government (e.g. Village, Town, City)"
    },
    { key: "national", value: "National Government" },
    { key: "nongovernmental", value: "Non-Governmental Organization" },
    { key: "philanthropic", value: "Philanthropic Organization" },
    { key: "regional", value: "Regional Government" },
    { key: "social", value: "Social Movement" },
    { key: "labortrade", value: "Labor/Trade Union" },
    { key: "n/a", value: "Not Applicable" }
  ],
  change_types: [
    {
      key: "changes",
      value: "Changes in people’s knowledge, attitudes, and behavior"
    },
    {
      key: "changes_civic",
      value: "Changes in civic capacities",
      longValue:
        "Changes in civic capacities (e.g. improved community problem solving)"
    },
    {
      key: "changes_public",
      value: "Changes in public policy",
      longValue: "Changes in public policy (e.g. new laws or regulations)"
    },
    {
      key: "changes_how",
      value: "Changes in how institutions operate",
      longValue:
        "Changes in how institutions operate (e.g. improved decision making)"
    },
    { key: "conflict", value: "Conflict transformation" }
  ],
  implementers_of_change: [
    {
      key: "lay",
      value: "Lay Public",
      longValue:
        "Lay Public (i.e. people with no professional stake in the issues) "
    },
    {
      key: "stakeholder",
      value: "Stakeholder Organizations",
      longValue:
        "Stakeholder Organizations (e.g. community groups, NGOs, business interests)"
    },
    { key: "elected", value: "Elected Public Officials" },
    {
      key: "appointed",
      value: "Appointed Public Servants",
      longValue: "Appointed Public Servants (e.g. bureaucrats)"
    },
    {
      key: "experts",
      value: "Experts",
      longValue:
        "Experts (e.g. scientists, engineers, criminologists, doctors, lawyers)"
    },
    { key: "corporations", value: "Corporations" },
    { key: "dont", value: "Don't Know" }
  ],
  sector: [
    { key: "for_profit", value: "For Profit" },
    { key: "government", value: "Government" },
    { key: "non_profit_non_gov", value: "Non-Profit or Non Governmental" },
    { key: "higher_ed", value: "Higher Education or Research" }
  ],
  level_polarization: [
    { key: "not", value: "Not polarized" },
    { key: "low", value: "Low polarization" },
    { key: "moderate", value: "Moderate polarization" },
    { key: "polarized", value: "Polarized" },
    { key: "high", value: "High polarization" }
  ],
  level_complexity: [
    { key: "very_low", value: "Very Low Complexity" },
    { key: "low", value: "Low Complexity" },
    { key: "moderate", value: "Moderate Complexity" },
    { key: "high", value: "High Complexity" },
    { key: "very_high", value: "Very High Complexity" }
  ]
};
