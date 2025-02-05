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
  console.log("📥 Fetching users from the database...");
  const users = await db.any(LIST_USER);
  console.log(`✅ Retrieved ${users.length} users from the database.`);
  return users;
}

// Check if a user is blocked in Auth0 by email
async function isUserBlocked(email) {
  try {
    console.log(`🔍 Checking Auth0 status for: ${email}`);
    const users = await auth0Client.getUsersByEmail(email);
    if (users.length === 0) {
      console.warn(`⚠️ User with email ${email} not found in Auth0.`);
      return false; // Assume user is active if not found
    }

    const blocked = users[0].blocked || false;
    console.log(
      `🔎 Status: ${email} is ${blocked ? "❌ BLOCKED" : "✅ ACTIVE"}`
    );
    return blocked;
  } catch (error) {
    console.error(`❌ Error fetching user by email ${email}:`, error.message);
    return false; // Assume user is not blocked if there's an error
  }
}

// Filter active users (not blocked)
async function filterActiveUsers() {
  console.log("🚀 Processing users to filter active ones...");
  const users = await fetchUsersFromDB();
  const activeUsers = [];

  for (const user of users) {
    if (user.email) {
      const blocked = await isUserBlocked(user.email);
      if (!blocked) {
        activeUsers.push(user);
      }
    } else {
      activeUsers.push(user);
    }
  }

  console.log(`✅ Found ${activeUsers.length} active users.`);
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
  console.log("⏳ Starting process to generate CSV file...");

  deleteExistingFile(); // Remove old file before creating a new one

  const activeUsers = await filterActiveUsers();

  if (activeUsers.length === 0) {
    console.log("⚠️ No active users found. CSV file not generated.");
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
  fs.writeFileSync(filePath, csv);
  console.log(`✅ CSV file generated successfully: ${filePath}`);
  console.log("🎉 Process completed!");
}

// Run the script
exportUsersToCSV();
