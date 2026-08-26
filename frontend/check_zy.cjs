const t = require("fs").readFileSync("bundle_new.js", "utf8");
const zyIdx = t.indexOf("zY=");
// Since zY= is -1, look for verifyZkArtifactIntegrity differently
// Find zY({manifest) pattern
const pattern = "zY({manifest";
const i = t.indexOf(pattern);
console.log("zY({manifest} at:", i, t.substring(i-100, i+200));
// Now find what zY is
// Find zY in the require/import
const re = /[,;{}]zY=/g;
let m;
while((m = re.exec(t)) !== null) {
  console.log("zY= at:", m.index, t.substring(m.index, m.index+300));
  break;
}
