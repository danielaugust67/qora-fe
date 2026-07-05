const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let replacedCount = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/bg-\[#0c66e4\]/g, 'bg-primary')
    .replace(/text-\[#0c66e4\]/g, 'text-primary')
    .replace(/border-\[#0c66e4\]/g, 'border-primary')
    .replace(/ring-\[#0c66e4\]/g, 'ring-primary')
    .replace(/hover:bg-\[#0c66e4\]/g, 'hover:bg-primary')
    .replace(/hover:text-\[#0c66e4\]/g, 'hover:text-primary')
    .replace(/hover:border-\[#0c66e4\]/g, 'hover:border-primary')
    .replace(/aria-selected:bg-\[#0c66e4\]/g, 'aria-selected:bg-primary')
    .replace(/hover:bg-\[#0055cc\]/g, 'hover:bg-primary\/90')
    .replace(/hover:bg-\[#0052cc\]/g, 'hover:bg-primary\/90');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated:', file);
    replacedCount++;
  }
});

console.log('Replaced in ' + replacedCount + ' files.');
