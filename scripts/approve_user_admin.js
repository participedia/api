const fs = require("fs");
const { db } = require("../api/helpers/db.js");

async function updateUser(id, currentDate) {
  try {
    return await db.none(
      "UPDATE users SET accepted_date = ${currentDate} WHERE id = ${id}",
      {
        id: id,
        accepted_date: accepted_date,
      }
    );
  } catch (err) {
    console.log("updateUser error - ", err);
  }
}

async function approveAdmin() {
  const usersToUpdate = await db.many(
    `SELECT * from USERS where isadmin = true ORDER BY id desc LIMIT 1`
  );
  const currentDate = new Date();
  await Promise.all(
    usersToUpdate.map(async user => {
      await updateUser(user.id, currentDate);
    })
  );
}

approveAdmin();
