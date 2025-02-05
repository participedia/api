require("dotenv").config();
const { db, pgp, LIST_USER } = require("../api/helpers/db.js");
const { ManagementClient } = require("auth0");
const fs = require("fs");
const { parse } = require("json2csv");
const path = require("path");

// File path
const filePath = path.join(__dirname, "active_users.csv");

// Auth0 ManagementClient Configuration
const auth0Client = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: "read:users",
});

// Fetch all users from the database
async function fetchUsersFromDB() {
  const users = await db.any(LIST_USER);
  return users;
}

// Check if a user is blocked in Auth0
async function isUserBlocked(auth0Id) {
  try {
    const user = await auth0Client.getUser({ id: auth0Id });
    return user.blocked || false;
  } catch (error) {
    console.error(`Error fetching user ${auth0Id}:`, error.message);
    return false; // Assume user is not blocked if there's an error
  }
}

// Filter active users (not blocked)
async function filterActiveUsers() {
  const users = await fetchUsersFromDB();
  const activeUsers = [];

  for (const user of users) {
    if (user.auth0_id) {
      const blocked = await isUserBlocked(user.auth0_id);
      if (!blocked) {
        activeUsers.push(user);
      }
    } else {
      activeUsers.push(user); // Users without an auth0_id are assumed to be active
    }
  }

  return activeUsers;
}

// Delete existing file
function deleteExistingFile() {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log("🗑️ Existing CSV file deleted.");
  }
}

// Export users to CSV
async function exportUsersToCSV() {
  deleteExistingFile(); // Remove old file before creating a new one

  const activeUsers = await filterActiveUsers();

  if (activeUsers.length === 0) {
    console.log("No active users found.");
    return;
  }

  // Convert JSON to CSV
  const csv = parse(activeUsers, {
    fields: [
      "id",
      "name",
      "email",
      "language",
      "accepted_date",
      "last_access_date",
    ],
  });

  // Save as CSV file
  fs.writeFileSync("active_users.csv", csv);
  console.log("✅ CSV file generated: active_users.csv");
}

// Run the script
exportUsersToCSV();
