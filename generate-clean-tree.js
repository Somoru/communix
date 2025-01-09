const { exec } = require("child_process");
const fs = require("fs");

exec("tree /F /A", { maxBuffer: 1024 * 1024 * 50 }, (err, stdout) => { // Increase buffer to 50 MB
    if (err) {
        console.error("Error generating directory tree:", err);
        return;
    }

    // Exclude any line mentioning 'node_modules' or subfolders
    const filteredTree = stdout
        .split("\n")
        .filter(line => !line.includes("node_modules"))
        .join("\n");

    fs.writeFileSync("directory_structure.txt", filteredTree);
    console.log("Filtered directory structure saved to directory_structure.txt");
});
