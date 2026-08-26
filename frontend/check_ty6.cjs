const t = require("fs").readFileSync("bundle_new.js", "utf8");
// Find TY specifically before the x5 class block
// TY is referenced at position ~812328
// Look in the range 811000-812200 for TY definition
const segment = t.substring(811000, 812500);
// find TY within this segment
const positions = [];
let i = 0;
while(i < segment.length) {
  const k = segment.indexOf("TY", i);
  if(k === -1) break;
  positions.push(segment.substring(k-10, k+50));
  i = k+1;
}
positions.forEach(p => console.log(p));
