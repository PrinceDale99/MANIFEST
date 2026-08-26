const t = require("fs").readFileSync("bundle_new.js", "utf8");
// TY must be imported or defined earlier in the file - find it in imports
// Look for e as TY, or {assertSafeName: TY}
const segment = t.substring(810000, 812400);
console.log("Full segment around x5:");
// show section where variables are assigned from imports before x5
// likely at start of the chunk
const i = segment.lastIndexOf(",TY,");
console.log("Found ,TY, at:", i);
console.log("Context:", segment.substring(Math.max(0, i-20), i+100));
// try also looking for TY in import destructure
const importRe = /\bTY\b/g;
let m;
while((m = importRe.exec(segment)) !== null) {
  console.log("TY at offset", m.index, ":", segment.substring(m.index-20, m.index+60));
}
