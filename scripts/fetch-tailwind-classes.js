const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function fetchCSSClasses(url, outputFileName) {
    try {
        const response = await axios.get(url);
        const cssText = response.data;
        const classRegex = /\.([a-zA-Z0-9_-]+)\s*{[^}]+}/g;
        const idRegex = /#([a-zA-Z0-9_-]+)\s*{[^}]+}/g;
        const classes = {};
        let match;

        while ((match = classRegex.exec(cssText)) !== null) {
            const className = match[1];
            const classDefinition = match[0];
            classes[className] = classDefinition;
        }

        while ((match = idRegex.exec(cssText)) !== null) {
            const idName = match[1];
            const idDefinition = match[0];
            classes[`#${idName}`] = idDefinition;
        }

        const jsonPath = path.join(__dirname, `../src/${outputFileName}`);
        fs.writeFileSync(jsonPath, JSON.stringify(classes, null, 2));
        console.log(`${outputFileName} has been fetched and saved.`);
    } catch (error) {
        console.error(`Failed to fetch CSS from ${url}`, error);
    }
}

async function fetchAllCSSClasses() {
    await fetchCSSClasses('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.css', 'tailwind-classes.json');
}

fetchAllCSSClasses();
