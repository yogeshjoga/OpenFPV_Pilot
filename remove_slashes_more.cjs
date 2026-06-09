
const fs = require("fs");

let file = "src/pages/Home/index.jsx";
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, "utf8");
    let newContent = content.replace(/Step \d{2}\s*\/\/\s*/g, (match) => match.replace(/\/\//, "-"));
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, "utf8");
        console.log("Fixed remaining Step // in Home/index.jsx");
    }
}

