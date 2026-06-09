const fs = require("fs");

function replaceInFile(file, replacements) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, "utf8");
    let newContent = content;
    for (const [search, replace] of replacements) {
        newContent = newContent.split(search).join(replace);
    }
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, "utf8");
    }
}

replaceInFile("src/config/constants.js", [
    ["An open-source learning platform", "A premium learning platform"]
]);

replaceInFile("src/data/parts.js", [
    ["dominant open-source protocol", "dominant protocol"],
    ["Open-source", "Advanced"]
]);

replaceInFile("src/data/vtxGogglesDB.json", [
    ["Open source, ", ""]
]);

replaceInFile("src/lib/pdfGenerator.js", [
    ["Open-Source Learning Platform", "Premium Learning Platform"]
]);

replaceInFile("src/pages/About/index.jsx", [
    ["Fully Open Source", "Premium Platform"],
    ["open-source future", "future"]
]);

replaceInFile("src/pages/Home/index.jsx", [
    ["label: 'Open Source'", "label: 'Premium Quality'"],
    ["extensive open-source database", "extensive database"],
    ["// Open Source FPV Learning", "// Professional FPV Learning"],
    ["open-source platform.", "platform."]
]);

console.log("Removed all open-source mentions.");
