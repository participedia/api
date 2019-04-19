 const sharedFieldOptions = require("./shared-field-options.js");

 const organizationFieldOptions = {
  scope_operations: [
    { key: "organization", value: "Organization" },
    { key: "neighbourhood", value: "Neighbourhood" },
    { key: "city/town", value: "City/Town" },
    { key: "metropolitan", value: "Metropolitan Area" },
    { key: "regional", value: "Regional" },
    { key: "national", value: "National" },
    { key: "multinational", value: "Multinational" },
    { key: "no_geo", value: "No Geographical Limits" }
  ],
  sector: [
    { key: "for_profit", value: "For Profit" },
    { key: "government", value: "Government" },
    { key: "non_profit_non_gov", value: "Non-Profit or Non Governmental" },
    { key: "higher_ed", value: "Higher Education or Research" }
  ],
};

module.exports = Object.assign({}, organizationFieldOptions, sharedFieldOptions);
