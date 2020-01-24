var request = require("request");
var fs = require("fs");

function capitalize(name) {
  return name[0].toUpperCase() + name.slice(1);
}

function massage_users(userlist) {
  return userlist.map(function(user) {
    return {
      name: capitalize(user.name.first) + capitalize(user.name.last),
      email: user.email,
    };
  });
}

var random_user_url =
  "https://randomuser.me/api/?nat=ca&seed=participedia&page=1&results=2500&format=json&inc=name,email&dl&noinfo";

request(random_user_url, function(error, response, body) {
  if (!error && response.statusCode == 200) {
    var userlist = JSON.parse(body).results;
    var updatedlist = massage_users(userlist);
    fs.writeFileSync("members.json", JSON.stringify(updatedlist, null, "\t"));
  }
});
