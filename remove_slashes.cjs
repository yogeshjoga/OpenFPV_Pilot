
const fs = require("fs");
const path = require("path");

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith(".jsx")) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk("src");
let count = 0;
files.forEach(f => {
    let content = fs.readFileSync(f, "utf8");
    
    // Replace eyebrow tags
    let newContent = content.replace(/>\s*\/\/\s*/g, ">");
    
    // Replace tagline strings in Home/index.jsx
    newContent = newContent.replace(/Step 01 \/\/ /g, "Step 01 - ");
    newContent = newContent.replace(/Step 02 \/\/ /g, "Step 02 - ");
    newContent = newContent.replace(/Step 03 \/\/ /g, "Step 03 - ");

    if (content !== newContent) {
        fs.writeFileSync(f, newContent, "utf8");
        count++;
    }
});
console.log(`Removed decorative slashes in ${count} files.`);

