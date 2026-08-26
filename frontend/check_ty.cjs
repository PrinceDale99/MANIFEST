const t = require("fs").readFileSync("bundle_new.js", "utf8");
const marker = "TY(n,`circuitId`)";
const i = t.indexOf(marker);
console.log("sendRequest found at:", i);
const ctx = t.substring(i-3000, i);
const j = ctx.lastIndexOf("TY=");
console.log("TY defined as:", ctx.substring(j, j + 400));
