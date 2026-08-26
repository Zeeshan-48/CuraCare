const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let count = 0;
walkDir('frontend/src', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace JS template literal currency: `$${...}` -> `₹${...}`
    content = content.replace(/\$\$\{/g, '₹${');
    
    // Replace JSX text currency: >${...} -> >₹{...}
    content = content.replace(/>\$\{/g, '>₹{');
    content = content.replace(/> \$\{/g, '> ₹{');
    
    // Replace JSX text currency with space: " ${...}" inside text nodes.
    // e.g. `Purchased at ${med.price.toFixed(2)}` -> `Purchased at ₹{med.price.toFixed(2)}`
    content = content.replace(/at \$\{/g, 'at ₹{');
    content = content.replace(/Price: \$\{/g, 'Price: ₹{');
    content = content.replace(/Savings: \$\{/g, 'Savings: ₹{');
    content = content.replace(/-\$\{/g, '-₹{');
    content = content.replace(/\(\$\{/g, '(₹{'); // Place Your Order (${...})
    
    // Replace literal $ before numbers
    content = content.replace(/\$100/g, '₹100');
    content = content.replace(/\$0/g, '₹0');
    content = content.replace(/\$10/g, '₹10');
    content = content.replace(/\$5/g, '₹5');
    
    // Replace in Cart totals or similar
    content = content.replace(/: '\$'/g, ": '₹'");
    content = content.replace(/FREE' : `\$\$\{/g, "FREE' : `₹${");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
      count++;
    }
  }
});
console.log('Total files updated:', count);
