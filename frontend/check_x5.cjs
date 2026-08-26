const t = require("fs").readFileSync("bundle_new.js", "utf8");
const x5Idx = t.indexOf("x5=class");
// Show the full class definition
const classText = t.substring(x5Idx, x5Idx + 3000);
console.log(classText);
