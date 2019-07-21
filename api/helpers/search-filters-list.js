const searchFiltersList = {
  case: [
    {
      sectionKey: "overview",
      sectionLabel: "Overview",
      fieldNameKeys: ["general_issues"]
    },
    {
      sectionKey: "location",
      sectionLabel: "Location",
      fieldNameKeys: ["country", "scope_of_influence"]
    },
    {
      sectionKey: "purpose_and_approach",
      sectionLabel: "Purpose & Approach",
      fieldNameKeys: ["purposes", "approaches", "public_spectrum"]
    },
    {
      sectionKey: "participants",
      sectionLabel: "Participants",
      fieldNameKeys: ["open_limited", "recruitment_method"]
    },
    {
      sectionKey: "process",
      sectionLabel: "Process",
      fieldNameKeys: ["method_types", "tools_techniques_types", "facetoface_online_or_both"]
    },
    {
      sectionKey: "organizers_supporters",
      sectionLabel: "Organizers & Supporters",
      fieldNameKeys: ["organizer_types", "funder_types"]
    },
    {
      sectionKey: "evidence_of_impact",
      sectionLabel: "Evidence of Impact",
      fieldNameKeys: ["change_types"]
    },
  ]
}

module.exports = searchFiltersList;
