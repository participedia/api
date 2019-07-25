process.env.MIGRATIONS = true;
const { db, helpers, pgp } = require("../api/helpers/db");
const fs = require("fs");

const tables = [
  "users",
  "localized_texts",
  "organizations",
  "methods",
  "cases",
  "authors"
];

const columns = {
  users: "id,name,email,language,language_1,accepted_date,last_access_date,login,auth0_user_id,join_date,picture_url,bio".split(
    ","
  ),
  localized_texts: "body,title,description,language,timestamp,thingid".split(
    ","
  ),
  organizations: "id,type,original_language,post_date,published,updated_date,location_name,address1,address2,city,province,postal_code,country,latitude,longitude,files,tags,featured,executive_director,issues,sector,links,hidden,videos,images".split(
    ","
  ),
  methods: "id,type,original_language,post_date,published,updated_date,hidden,completeness,images,videos,facilitated,geographical_scope,participant_selections,recruitment_method,communication_modes,decision_method,if_voting,public_interaction_methods:raw,issue_polarization,issue_technical_complexity,issue_interdependency".split(
    ","
  ),
  cases: "id,type,original_language,post_date,published,updated_date,location_name,address1,address2,city,province,postal_code,country,latitude,longitude,files,tags,featured,relationships,issues,specific_topics,is_component_of,scope_of_influence,start_date,end_date,ongoing,time_limited,purposes,approaches,public_spectrum,number_of_participants,open_limited,recruitment_method,targeted_participants,legality,facilitators,facilitator_training,facetoface_online_or_both,participants_interactions,learning_resources,decision_methods,if_voting,insights_outcomes,primary_organizers,organizer_types,funder,funder_types,staff,volunteers,impact_evidence,change_types,implementers_of_change,formal_evaluation,evaluation_reports,evaluation_links,links,hidden,videos,images".split(
    ","
  ),
  related_things: "type_1,id_1,type_2,id_2".split(","),
  authors: "user_id,timestamp,thingid".split(",")
};

const filename = f => `migrations/${f}.json`;

async function load_table(table) {
  // Only load the real users file if it exists, otherwise use fake users for testing
  let data;
  if (table === "users" && !fs.existsSync(filename(table))) {
    console.log("loading fake users from %s", filename("fake_users"));
    data = JSON.parse(fs.readFileSync(filename("fake_users")));
  } else {
    data = JSON.parse(fs.readFileSync(filename(table)));
  }
  // Creating a reusable / static ColumnSet for generating INSERT queries:
  const cs = new helpers.ColumnSet(columns[table], { table });
  const insert = helpers.insert(data, cs);
  return db
    .none(insert)
    .then(() => console.log(`success inserting ${table}`))
    .catch(error => {
      console.error(`table: ${table}`);
      console.trace(error);
    });
}

async function load_all_tables() {
  await load_table("users");
  await load_table("localized_texts");
  await load_table("organizations");
  await load_table("methods");
  await load_table("cases");
  await load_table("authors");
  // db.none("REFRESH MATERIALIZED VIEW search_index_en;");
  await db.one("select setval('things_id_seq', (select max(id) from cases) +1 );");
  await db.one("select setval('users_id_seq', (select max(id) from users) + 1);");
}

load_all_tables();
