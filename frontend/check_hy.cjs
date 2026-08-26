const t = require("fs").readFileSync("bundle_new.js", "utf8");
const hyIdx = t.indexOf("HY=");
console.log("HY at:", hyIdx, t.substring(hyIdx, hyIdx + 300));
// Also check HY.fetch in context
const hyFetchIdx = t.indexOf("HY.fetch");
console.log("HY.fetch context:", t.substring(hyFetchIdx - 50, hyFetchIdx + 100));
