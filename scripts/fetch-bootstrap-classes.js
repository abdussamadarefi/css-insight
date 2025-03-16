const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function fetchBootstrapClasses() {
  try {
    const response = await axios.get('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css');
    const cssText = response.data;
    const regex = /\.([a-zA-Z0-9_-]+)\s*{[^}]+}/g;
    let match;
    const classes = {};
    while ((match = regex.exec(cssText)) !== null) {
      classes[match[1]] = match[0];
    }
    const outputPath = path.join(__dirname, '../src/bootstrap-classes.json');
    fs.writeFileSync(outputPath, JSON.stringify(classes, null, 2));
    console.log('bootstrap-classes.json has been updated.');
  } catch (error) {
    console.error('Error fetching Bootstrap CSS:', error);
  }
}

fetchBootstrapClasses();
