const t = require("fs").readFileSync("bundle_new.js", "utf8");
// "TY" as a module-level function import - the bundle uses import {xx as TY}
// Let me look at LY, IY, zY used in the same x5 class and find TY nearby
const iyIdx = t.indexOf("IY=");
console.log("IY at:", iyIdx, t.substring(iyIdx, iyIdx + 200));
const lyIdx = t.indexOf("LY=");
console.log("LY at:", lyIdx, t.substring(lyIdx, lyIdx + 200));
const zyIdx = t.indexOf("zY=");
console.log("zY at:", zyIdx, t.substring(zyIdx, zyIdx + 200));
// TY should be near these
const tyIdx = t.indexOf("TY=");
console.log("TY= at:", tyIdx, t.substring(tyIdx, tyIdx + 200));
