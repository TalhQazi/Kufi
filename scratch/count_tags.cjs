const fs = require('fs');
const content = fs.readFileSync('d:/Projects/Kufi/src/pages/adminpannel/activity.jsx', 'utf8');

const openDivs = (content.match(/<div/g) || []).length;
const closeDivs = (content.match(/<\/div>/g) || []).length;
const openBraces = (content.match(/{/g) || []).length;
const closeBraces = (content.match(/}/g) || []).length;
const openParens = (content.match(/\(/g) || []).length;
const closeParens = (content.match(/\)/g) || []).length;

console.log(`Open Divs: ${openDivs}, Close Divs: ${closeDivs}`);
console.log(`Open Braces: ${openBraces}, Close Braces: ${closeBraces}`);
console.log(`Open Parens: ${openParens}, Close Parens: ${closeParens}`);
