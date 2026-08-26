const t = require("fs").readFileSync("bundle_new.js", "utf8");
const marker = "TY(n,`circuitId`)";
const i = t.indexOf(marker);
// Find where TY was defined - look for TY in the 500 chars before this call
const nearby = t.substring(i-500, i+100);
console.log("NEARBY:", nearby);
