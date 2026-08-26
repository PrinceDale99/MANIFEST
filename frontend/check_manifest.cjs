const t = require("fs").readFileSync("bundle_new.js", "utf8");
const oyIdx = t.indexOf("OY=");
console.log("OY at:", oyIdx, t.substring(oyIdx, oyIdx + 150));
const kyIdx = t.indexOf("kY=");
console.log("kY at:", kyIdx, t.substring(kyIdx, kyIdx + 150));
