const searchFiltersList = {
  method: [
    {
      sectionKey: "type_purpose_sectionlabel",
      fieldNameKeys: ["method_types", "purpose_method", "public_spectrum"],
    },
    {
      sectionKey: "participants",
      fieldNameKeys: [
        "open_limited",
        "recruitment_method",
        "number_of_participants",
      ],
    },
    {
      sectionKey: "process",
      fieldNameKeys: [
        "facetoface_online_or_both",
        "facilitators",
        "participants_interactions",
        "decision_methods",
      ],
    },
    {
      sectionKey: "suitable_for_sectionlabel",
      fieldNameKeys: [
        "scope_of_influence",
        "level_polarization",
        "level_complexity",
      ],
    },
    {
      sectionKey: "Entry Completeness",
      fieldNameKeys: ["completeness"],
    },
  ],
  organizations: [
    {
      sectionKey: "country_label",
      fieldNameKeys: ["country"],
    },
    {
      sectionKey: "organizations_view_scope_of_influence_label",
      fieldNameKeys: ["scope_of_influence"],
    },
    {
      sectionKey: "focus_areas_sectionlabel",
      fieldNameKeys: ["sector", "general_issues"],
    },
    {
      sectionKey: "process",
      fieldNameKeys: ["type_method", "type_tool"],
    },
    {
      sectionKey: "Entry Completeness",
      fieldNameKeys: ["completeness"],
    }
  ],
  case: [
    {
      sectionKey: "issues",
      fieldNameKeys: ["general_issues"],
    },
    {
      sectionKey: "country_label",
      fieldNameKeys: ["country", "scope_of_influence"],
    },
    {
      sectionKey: "purpose_and_approach",
      fieldNameKeys: ["purposes", "approaches", "public_spectrum"],
    },
    {
      sectionKey: "participants",
      fieldNameKeys: ["open_limited", "recruitment_method"],
    },
    {
      sectionKey: "process",
      fieldNameKeys: [
        "method_types",
        "tools_techniques_types",
        "facetoface_online_or_both",
      ],
    },
    {
      sectionKey: "organizers_supporters",
      fieldNameKeys: ["organizer_types", "funder_types"],
    },
    {
      sectionKey: "evidence_of_impact",
      fieldNameKeys: ["change_types"],
    },
    {
      sectionKey: "Entry Completeness",
      fieldNameKeys: ["completeness"],
    },
  ],
};

module.exports = searchFiltersList;
