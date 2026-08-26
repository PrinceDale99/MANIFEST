const t = require("fs").readFileSync("bundle_new.js", "utf8");
// Look for where zY is assigned - check every spot with "zY"
const re = /\bzY\b/g;
let m;
const spots = [];
while((m = re.exec(t)) !== null) {
  spots.push({pos: m.index, ctx: t.substring(m.index-5, m.index+100)});
}
// Group by unique first 20 chars of context
const unique = new Set();
spots.forEach(s => {
  const key = s.ctx.substring(0, 30);
  if(!unique.has(key)) {
    unique.add(key);
    console.log("POS:", s.pos, "CTX:", s.ctx);
  }
});
