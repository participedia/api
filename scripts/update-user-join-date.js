const fs = require("fs");
const parse = require("csv-parse");
const { db } = require("../api/helpers/db.js");

async function updateUser(id, joinDate) {
  try {
    return await db.none("UPDATE users SET join_date = ${joinDate} WHERE id = ${id}", {
      id: id,
      joinDate: joinDate
    });
  } catch (err) {
    console.log("updateUser error - ", err)
  }

}

async function startUpdate() {
  const usersToUpdate = await db.many(`SELECT * from users WHERE join_date IS NULL`);
  const earliestAllowedJoinDate = new Date("2009-01-01");
  await Promise.all(usersToUpdate.map(async user => {
    let joinDate = user.last_access_date || new Date("2018-06-06 00:00:00");
    if (joinDate < earliestAllowedJoinDate) {
      joinDate = earliestAllowedJoinDate;
    }
    await updateUser(user.id, joinDate);
  }));
}

startUpdate();
