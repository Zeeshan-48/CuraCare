const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('frontend/src', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace literal $ followed by { or digit when it's clearly for money
    // e.g. "       ${order.totalAmount.toFixed(2)}"
    // e.g. "       ${(discountedPrice * item.quantity).toFixed(2)}"
    // Look for lines that have whitespace, then $, then {
    content = content.replace(/^(\s*)\$\{(.+?\.toFixed\(\d\))\}/gm, '$1₹{$2}');
    
    // Look for text: "Add $10 more" -> "Add ₹10 more"
    content = content.replace(/Add \$\{(.+?)\} more/g, 'Add ₹{$1} more');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});
