const t = require("fs").readFileSync("bundle_new.js", "utf8");
// The assertSafeName was simplified to "return;" in the CJS we saw earlier
// Let me check what TY does - look for its body
// TY appears in one location - find it via the surrounding code structure
// The x5 class is built with these vars: g5=keys, _5=.prover, v5=.verifier, y5=zkir, b5=.bzkir
const keysIdx = t.indexOf("g5=`keys`");
console.log("g5 context:", t.substring(keysIdx - 200, keysIdx + 200));
