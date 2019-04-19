const sharedFieldOptions = require("./shared-field-options.js");

const caseFieldOptions = {
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
    { key: "opinion", value: "Opinion Survey" },
    { key: "idea", value: "Idea Generation" },
    { key: "general", value: "General Agreement/Consensus" },
    { key: "voting", value: "Voting" },
    { key: "yes", value: "Yes" },
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
    { key: "advocacy", value: "Advocacy" },
    { key: "citizenship", value: "Citizenship building" },
    { key: "civil", value: "Civil society building" },
    { key: "cogovernance", value: "Co-governance" },
    {
      key: "coproduction",
      value:
        "Co-production in form of partnership and/or contract with government and/or public bodies"
    },
    {
      key: "coproduction_form",
      value:
        "Co-production in form of partnership and/or contract with private organisations"
    },
    { key: "consultation", value: "Consultation" },
    { key: "direct", value: "Direct decision making" },
    { key: "independent", value: "Independent action" },
    {
      key: "informal",
      value:
        "Informal engagement by intermediaries with nongovernmental authorities"
    },
    {
      key: "informal_engagement",
      value: "Informal engagement by intermediaries with political authorities"
    },
    { key: "leadership", value: "Leadership development" },
    { key: "evaluation", value: "Evaluation, oversight, & social auditing" },
    { key: "protest", value: "Protest" },
    { key: "research", value: "Research" },
    { key: "social", value: "Social mobilization" }
  ],
  open_limited: [
    { key: "open", value: "Open to All" },
    {
      key: "open_to",
      value: "Open to All With Special Effort to Recruit Some Groups"
    },
    { key: "limited", value: "Limited to Only Some Groups or Individuals" },
    { key: "both", value: "Both" }
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
    { key: "appointed", value: "Appointed Public Servants" },
    { key: "lgbt", value: "Gay/Lesbian/Bisexual/Transgender" },
    { key: "elderly", value: "Elderly" },
    { key: "elected", value: "Elected Public Officials" },
    { key: "experts", value: "Experts" },
    { key: "indigenous", value: "Indigenous People" },
    { key: "immigrants", value: "Immigrants" },
    { key: "lowincome", value: "Low-Income Earners" },
    { key: "men", value: "Men" },
    { key: "people", value: "People with Disabilities" },
    { key: "racialethnic", value: "Racial/Ethnic Groups" },
    { key: "religious", value: "Religious Groups" },
    { key: "stakeholder", value: "Stakeholder Organizations" },
    { key: "students", value: "Students" },
    { key: "women", value: "Women" },
    { key: "youth", value: "Youth" }
  ],
  tools_techniques_types: [
    { key: "manage", value: "Manage and/or allocate money or resources" },
    { key: "collect", value: "Collect, analyse and/or solicit feedback" },
    {
      key: "facilitate",
      value: "Facilitate dialogue, discussion, and/or deliberation"
    },
    { key: "facilitate_decisionmaking", value: "Facilitate decision-making" },
    { key: "legislation", value: "Legislation, policy, or frameworks" },
    { key: "recruit", value: "Recruit or select participants" },
    { key: "plan", value: "Plan, map and/or visualise options and proposals" },
    {
      key: "propose",
      value: "Propose and/or develop policies, ideas, and recommendations"
    },
    { key: "inform", value: "Inform, educate and/or raise awareness" }
  ],
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
    { key: "video", value: "Video Presentations" },
    { key: "written", value: "Written Briefing Materials" },
    { key: "no_info", value: "No Information Was Provided to Participants" },
    { key: "not", value: "Not Relevant to this Type of Initiative" }
  ],
  if_voting: [
    { key: "preferential", value: "Preferential Voting" },
    { key: "plurality", value: "Plurality" },
    { key: "majoritarian", value: "Majoritarian Voting" },
    { key: "supermajoritarian", value: "Super-Majoritarian" },
    { key: "unanimous", value: "Unanimous Decision" },
    { key: "dont", value: "Don’t Know" }
  ],
  insights_outcomes: [
    { key: "artistic", value: "Artistic Expression" },
    { key: "traditional", value: "Traditional Media" },
    { key: "new", value: "New Media" },
    { key: "independent", value: "Independent Media" },
    { key: "public", value: "Public Report" },
    { key: "minority", value: "Minority Report" },
    { key: "petitions", value: "Petitions" },
    { key: "protestspublic", value: "Protests/Public Demonstrations" },
    { key: "public_hearingsmeetings", value: "Public Hearings/Meetings" },
    { key: "word", value: "Word of Mouth" },
    { key: "yes", value: "Yes" }
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
    { key: "local", value: "Local Government" },
    { key: "national", value: "National Government" },
    { key: "nongovernmental", value: "Non-Governmental Organization" },
    { key: "philanthropic", value: "Philanthropic Organization" },
    { key: "regional", value: "Regional Government" },
    { key: "social", value: "Social Movement" },
    { key: "labortrade", value: "Labor/Trade Union" },
    { key: "yes", value: "Yes" }
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
    { key: "local", value: "Local Government" },
    { key: "national", value: "National Government" },
    { key: "nongovernmental", value: "Non-Governmental Organization" },
    { key: "philanthropic", value: "Philanthropic Organization" },
    { key: "regional", value: "Regional Government" },
    { key: "social", value: "Social Movement" },
    { key: "labortrade", value: "Labor/Trade Union" },
    { key: "yes", value: "Yes" }
  ],
  change_types: [
    {
      key: "changes",
      value: "Changes in people’s knowledge, attitudes, and behavior"
    },
    { key: "changes_civic", value: "Changes in civic capacities" },
    { key: "changes_public", value: "Changes in public policy" },
    { key: "changes_how", value: "Changes in how institutions operate" },
    { key: "conflict", value: "Conflict transformation" }
  ],
  implementers_of_change: [
    { key: "lay", value: "Lay Public" },
    { key: "stakeholder", value: "Stakeholder Organizations" },
    { key: "elected", value: "Elected Public Officials" },
    { key: "appointed", value: "Appointed Public Servants" },
    { key: "experts", value: "Experts" },
    { key: "corporations", value: "Corporations" },
    { key: "dont", value: "Don't Know" }
  ]
};

module.exports = Object.assign({}, caseFieldOptions, sharedFieldOptions);
