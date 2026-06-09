
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
            if (file.endsWith(".js") || file.endsWith(".jsx") || file.endsWith(".css")) {
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
    // Replace lines starting with // followed by multiple =, -, _, or similar.
    // Also remove lines like // Routes — AppRouter if surrounded by such borders
    // Let just remove any line that starts with // and has at least 3 =, -, or _
    let newContent = content.replace(/^\s*\/\/\s*[=\-_]{3,}.*(\r?\n)?/gm, "");
    
    // Also let s remove lines that look like headlines, e.g., // Some Section Name
    // if they immediately followed a border. But maybe just the borders is what they meant.
    // Actually, "remove all // prefix headlines". Let s remove anything like `// =====...` and also lines that only have `// Text` if they look like a header. 
    // Wait, the safest is to remove lines like:
    // // ================================
    // // Some text
    // // ================================
    
    // regex for the block:
    let regexBlock = /^\s*\/\/\s*[=\-_]{3,}.*\r?\n^\s*\/\/\s*.*?\r?\n^\s*\/\/\s*[=\-_]{3,}.*\r?\n/gm;
    newContent = content.replace(regexBlock, "");
    
    // also single border lines just in case
    newContent = newContent.replace(/^\s*\/\/\s*[=\-_]{3,}.*(\r?\n)?/gm, "");

    if (content !== newContent) {
        fs.writeFileSync(f, newContent, "utf8");
        count++;
    }
});
console.log(`Modified ${count} files to remove headers.`);

