const t = require("fs").readFileSync("bundle_new.js", "utf8");
// Check the import statement that pulls TY in - it's an import binding
// find the import block that contains TY
const importIdx = t.indexOf("TY");
console.log("First TY at:", importIdx, t.substring(importIdx-20, importIdx+80));
// Find the x5 class block and look for imports before it  
const x5Idx = t.indexOf("x5=class");
const importBlock = t.substring(x5Idx - 2000, x5Idx);
// find TY in import block
const tyInImport = importBlock.lastIndexOf("TY");
console.log("TY in importBlock:", importBlock.substring(tyInImport-20, tyInImport+100));
