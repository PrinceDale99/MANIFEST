const t = require("fs").readFileSync("bundle_new.js", "utf8");
// The bundle imports TY from somewhere - find "TY" as standalone word assignment
const re = /\bTY\b\s*=/g;
let match;
const found = [];
while((match = re.exec(t)) !== null && found.length < 10) {
  found.push({ pos: match.index, text: t.substring(match.index, match.index+100) });
}
console.log(JSON.stringify(found, null, 2));
