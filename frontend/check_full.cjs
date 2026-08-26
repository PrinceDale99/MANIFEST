const t = require("fs").readFileSync("bundle_new.js", "utf8");
// Let me look at the module-level imports at the top of the file
console.log("TOP 3000:", t.substring(0, 3000));
