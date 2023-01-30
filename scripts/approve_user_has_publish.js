const fs = require("fs");
const { db, ENTRIES_BY_USER } = require("../api/helpers/db.js");

async function checkIfHasHidden(user_id) {
  const thingsList = await db.many(ENTRIES_BY_USER, {
    user_id: user_id
  });
  let hasHidden = false;
  await Promise.all(
    thingsList.map(async things => {
      if (things.hidden === true){
        hasHidden = true;
      }
    })
  );

  return hasHidden;
}

async function updateUser(id, currentDate) {
  try {
    return await db.none(
      "UPDATE users SET accepted_date = ${currentDate} WHERE id = ${id}",
      {
        id: id,
        accepted_date: currentDate,
      }
    );
  } catch (err) {
    console.log("updateUser error - ", err);
  }
}

async function approveUserHasPublish() {
  const usersToUpdate = await db.many(
    `SELECT DISTINCT ON (user_id) * FROM  authors ORDER  BY user_id DESC NULLS LAST`
  );
  const currentDate = new Date();
  await Promise.all(
    usersToUpdate.map(async user => {
      let noHiddenEntries = await checkIfHasHidden(user.id);
      if (noHiddenEntries && usersToUpdate.length > 0){
        await updateUser(user.id, currentDate);
      }
    })
  );
}

approveUserHasPublish();
