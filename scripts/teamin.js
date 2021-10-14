const fs = require("fs");

const teamlist = fs.readFileSync("./t.json", "utf8");
const teamListArr = teamlist.split("]");
let currentSectionIndex = 0;
const teamArr = [];
teamListArr.forEach(line => {
  const lineTextCleaned = line
    .replace("\n", "")
    .replace("[", "")
    .trim();
  console.log(lineTextCleaned);
  if (lineTextCleaned.includes("***")) {
    const newSection = {};
    teamArr.push(newSection);
    currentSectionIndex = teamArr.length - 1;
    previousLineType = "sectionStart";
    return;
  }
  if (previousLineType === "sectionStart") {
    teamArr[currentSectionIndex]["name"] = lineTextCleaned;
    previousLineType = "sectionName";
    return;
  }
  if (previousLineType === "sectionName") {
    teamArr[currentSectionIndex]["members"] =
      teamArr[currentSectionIndex]["members"] || [];
    const lineMemberInfo = lineTextCleaned.split(",");
    teamArr[currentSectionIndex]["members"].push({
      name: lineMemberInfo[0]?.trim() || "",
      titleKey: lineMemberInfo[1]?.trim() || "",
      descriptors: lineMemberInfo.length > 2 ? lineMemberInfo.slice(2) : [],
    });
  }
});
console.log(JSON.stringify(teamArr));
fs.writeFileSync("./team.json", JSON.stringify(teamArr));
