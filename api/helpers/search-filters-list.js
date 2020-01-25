const searchFiltersList = {
  method: [
    {
      sectionKey: "Type & Purpose",
      sectionLabel: "Type & Purpose",
      fieldNameKeys: ["method_types", "purpose_method", "public_spectrum"],
    },
    {
      sectionKey: "Participants",
      sectionLabel: "Participants",
      fieldNameKeys: [
        "open_limited",
        "recruitment_method",
        "number_of_participants",
      ],
    },
    {
      sectionKey: "Process",
      sectionLabel: "Process",
      fieldNameKeys: [
        "facetoface_online_or_both",
        "facilitators",
        "participants_interactions",
        "decision_methods",
      ],
    },
    {
      sectionKey: "Suitable For",
      sectionLabel: "Suitable For",
      fieldNameKeys: [
        "scope_of_influence",
        "level_polarization",
        "level_complexity",
      ],
    },
    {
      sectionKey: "Entry Completeness",
      sectionLabel: "Entry Completeness",
      fieldNameKeys: ["completeness"],
    },
  ],
  organizations: [
    {
      sectionKey: "Country",
      sectionLabel: "Country",
      fieldNameKeys: ["country"],
    },
    {
      sectionKey: "Scope of Operations",
      sectionLabel: "Scope of Operations",
      fieldNameKeys: ["scope_of_influence"],
    },
    {
      sectionKey: "Focus Area",
      sectionLabel: "Focus Area",
      fieldNameKeys: ["sector", "general_issues"],
    },
    {
      sectionKey: "Process",
      sectionLabel: "Process",
      fieldNameKeys: ["type_method", "type_tool"],
    },
    {
      sectionKey: "Entry Completeness",
      sectionLabel: "Entry Completeness",
      fieldNameKeys: ["completeness"],
    },
  ],
  case: [
    {
      sectionKey: "issues",
      sectionLabel: "Issues",
      fieldNameKeys: ["general_issues"],
    },
    {
      sectionKey: "location",
      sectionLabel: "Location",
      fieldNameKeys: ["country", "scope_of_influence"],
    },
    {
      sectionKey: "purpose_and_approach",
      sectionLabel: "Purpose & Approach",
      fieldNameKeys: ["purposes", "approaches", "public_spectrum"],
    },
    {
      sectionKey: "participants",
      sectionLabel: "Participants",
      fieldNameKeys: ["open_limited", "recruitment_method"],
    },
    {
      sectionKey: "process",
      sectionLabel: "Process",
      fieldNameKeys: [
        "method_types",
        "tools_techniques_types",
        "facetoface_online_or_both",
      ],
    },
    {
      sectionKey: "organizers_supporters",
      sectionLabel: "Organizers & Supporters",
      fieldNameKeys: ["organizer_types", "funder_types"],
    },
    {
      sectionKey: "evidence_of_impact",
      sectionLabel: "Evidence of Impact",
      fieldNameKeys: ["change_types"],
    },
    {
      sectionKey: "collections",
      sectionLabel: "Collections",
      fieldNameKeys: ["collections"],
    },
    {
      sectionKey: "Entry Completeness",
      sectionLabel: "Entry Completeness",
      fieldNameKeys: ["completeness"],
    },
  ],
};

module.exports = searchFiltersList;
