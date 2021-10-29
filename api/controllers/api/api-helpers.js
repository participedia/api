const selectedCategoryValues = ['all', 'case', 'method', 'organization', 'collection'];

const {
    as
} = require("../../helpers/db");

const searchFilterKeys = type => {
    if (type === "case") {
      return [
        "country",
        "scope_of_influence",
        "public_spectrum",
        "open_limited",
        "recruitment_method",
        "facetoface_online_or_both",
      ];
    } else if (type === "method") {
      return [
        "open_limited",
        "recruitment_method",
        "facetoface_online_or_both",
        "public_spectrum",
        "level_polarization",
        "level_complexity",
        "facilitators",
      ];
    } else if (type === "organization") {
      return ["country", "sector"];
    } else {
      return [];
    }
  };
  
  const searchFilterKeyLists = type => {
    if (type === "case") {
      return [
        "general_issues",
        "purposes",
        "approaches",
        "method_types",
        "tools_techniques_types",
        "organizer_types",
        "funder_types",
        "change_types",
        "completeness",
        "collections",
      ];
    } else if (type === "method") {
      return [
        "method_types",
        "number_of_participants",
        "participants_interactions",
        "decision_methods",
        "scope_of_influence",
        "purpose_method",
        "completeness",
        "collections",
      ];
    } else if (type === "organization") {
      return [
        "general_issues",
        "type_method",
        "level_polarization",
        "scope_of_influence",
        "type_tool",
        "completeness",
        "collections",
      ];
    } else {
      return [];
    }
  };

const apiErrorHandler = async (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    res.status(err.status || 500).send({ msg: err.message });
    next(err);
}

const auth = async (req, res, next) => {
    let allowedKeys;
    try {
        allowedKeys = JSON.parse(process.env.ALLOWED_API_KEYS || '[]');
    } catch (e) {
        next(new Error('ALLOWED_API_KEYS is not a valid JSON string'));
        return;
    }
    
    if (!allowedKeys.includes(req.headers.api_key)) {
        return res.status(401).json({
            error: "Invalid Participedia API Key",
        });
    }
    next();
}

const searchFiltersFromReq = req => {
    const keys = searchFilterKeys(typeFromReq(req));
    const keyLists = searchFilterKeyLists(typeFromReq(req));
  
    let searchFilterKeysMapped = keys.map(key =>
      searchFilterKeyFromReq(req, key)
    );
    let searchFilterKeyListMapped = keyLists.map(key =>
      searchFilterKeyListFromReq(req, key)
    );
    return searchFilterKeysMapped.join("") + searchFilterKeyListMapped.join("");
  };

  const typeFromReq = req => {
    var cat = singularLowerCase("case");
    if (selectedCategoryValues.indexOf(cat) < 0) {
      cat = 'all';
    }
    return cat === "all" ? "thing" : cat;
  };

  const singularLowerCase = name =>
  (name.slice(-1) === "s" ? name.slice(0, -1) : name).toLowerCase();

  const searchFilterKeyFromReq = (req, name) => {
    let value = req.query[name];
    if (value) {
      if (name === "country") {
        return ` AND ${name} = ANY ('{${value}}') `;
      } else {
        const values = value.split(',');
        let partial = values.length ? ' AND ' : '';
        partial += values[0] ? ` ${name}='${values[0]}'` : '';
        for (let i = 1; i < values.length; i++) {
          const element = values[i];
          partial += ` OR ${name}='${element}' `;
        }
        return partial;
      } 
    }
  };
  
  const searchFilterKeyListFromReq = (req, name) => {
    let value = req.query[name];
    if (!value) {
      return "";
    }
    if (name === "completeness") {
      return ` AND ${name} = ANY ('{${value}}') `;
    }  
    else {
      value = as.array(value.split(","));
      return ` AND ${name} && ${value} `;
    }
  };

module.exports = {
    searchFiltersFromReq,
    apiErrorHandler,
    auth
}