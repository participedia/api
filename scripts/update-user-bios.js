const fs = require("fs");
const parse = require("csv-parse");

const { db, USER_BY_ID, UPDATE_USER } = require("../api/helpers/db.js");

parseUserData();

async function updateUser(id, bio, name) {
  try {
    return await db.none(UPDATE_USER, {
      id: id,
      bio: bio,
      name: name,
    });
  } catch (err) {
    console.log("updateUser error - ", err);
  }
}

async function getUser(id) {
  try {
    return await db.oneOrNone(USER_BY_ID, {
      userId: id,
      language: "en",
    });
  } catch (err) {
    console.log("getUser error - ", err);
  }
}

async function handleRow(row) {
  const id = parseInt(row[8].split("/")[4], 10);
  const name = row[0];
  const oldDotNetBio = row[6];

  if (!Number.isInteger(id)) {
    console.log("id is not int", id);
    return;
  }

  const user = await getUser(id);
  if (user && !user.bio && oldDotNetBio) {
    console.log("updating bio for id: ", id);
    updateUser(id, oldDotNetBio, name);
  }
}

function parseUserData() {
  fs.createReadStream("./scripts/user-export-from-old-dot-net.csv")
    .pipe(parse({ delimiter: "," }))
    .on("data", row => {
      handleRow(row);
    });
}
