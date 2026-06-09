
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

replaceInFile("src/data/parts.js", [
    ["Most popular. Best performance. Free.", "Most popular. Best performance."],
    ["free protocol", "open protocol"]
]);

replaceInFile("src/lib/pdfGenerator.js", [
    ["Free Open-Source", "Open-Source"]
]);

replaceInFile("src/pages/About/index.jsx", [
    ["is free forever.", "is available to everyone."]
]);

replaceInFile("src/pages/Home/index.jsx", [
    ["Free & Open Source", "Open Source"],
    ["free, open-source platform", "open-source platform"],
    ["freestyle drone for free.", "freestyle drone."]
]);

replaceInFile("src/pages/ProductDetail/index.jsx", [
    ["<strong>FREE Delivery</strong>", "<strong>Delivery</strong>"]
]);

console.log("Removed free mentions.");

