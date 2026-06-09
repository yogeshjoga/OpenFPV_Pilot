
const fs = require("fs");
const path = require("path");

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            // Skip node_modules and .git
            if (!file.includes("node_modules") && !file.includes(".git")) {
                results = results.concat(walk(file));
            }
        } else { 
            results.push(file);
        }
    });
    return results;
}

const files = walk(".");
let count = 0;
files.forEach(f => {
    // Only process text files (skip images, etc.)
    if (!f.match(/\.(jsx?|css|html|json|md|txt|svg)$/)) return;
    
    let content = fs.readFileSync(f, "utf8");
    let newContent = content
        .replace(/OpenFPV Pilot/g, "EgireRobatics")
        .replace(/OpenFPV_Pilot/g, "EgireRobatics")
        .replace(/OpenFPV/g, "EgireRobatics")
        .replace(/openfpv/g, "egirerobatics");
        
    if (content !== newContent) {
        fs.writeFileSync(f, newContent, "utf8");
        count++;
    }
});
console.log(`Modified ${count} files for renaming to EgireRobatics.`);

