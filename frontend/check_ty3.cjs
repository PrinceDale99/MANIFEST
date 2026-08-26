const t = require("fs").readFileSync("bundle_new.js", "utf8");
// TY is imported/defined - search for TY=function or TY = function or where TY is set in module imports
// Look for var/let/const TY
const matches = [];
let j = 0;
while(true) {
  const k = t.indexOf(",TY=", j);
  if(k === -1) break;
  matches.push({ pos: k, text: t.substring(k, k+200) });
  j = k + 1;
}
console.log("Matches:", JSON.stringify(matches, null, 2));
