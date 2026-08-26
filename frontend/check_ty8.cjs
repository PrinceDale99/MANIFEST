const t = require("fs").readFileSync("bundle_new.js", "utf8");
// TY appears between the subscriptionURL block and the x5 class - search for TY in that region
const g5Idx = t.indexOf("g5=`keys`");
const before = t.substring(g5Idx - 5000, g5Idx);
const tyInBefore = before.lastIndexOf("TY");
console.log("TY in region before g5:", before.substring(tyInBefore - 30, tyInBefore + 200));
