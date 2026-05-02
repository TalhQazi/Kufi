const fs = require('fs');
const path = require('path');

function checkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                checkDir(fullPath);
            }
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('useEffect(') && !content.includes('import {') && !content.includes('import React, {')) {
                 // Check if it's using React.useEffect
                 if (!content.includes('React.useEffect(')) {
                     console.log('POTENTIAL ISSUE IN:', fullPath);
                 }
            } else if (content.includes('useEffect(') && !content.includes('useEffect') && !content.includes('React.useEffect')) {
                 console.log('POTENTIAL ISSUE IN (missing import):', fullPath);
            }
            
            // Simplified check: if 'useEffect(' is present, is it either 'React.useEffect(' or is 'useEffect' in the imports?
            const hasUseEffect = content.match(/[^.]useEffect\(/);
            if (hasUseEffect) {
                const hasImport = content.match(/import\s*{[^}]*useEffect[^}]*}\s*from\s*['"]react['"]/);
                if (!hasImport) {
                    console.log('DEFINITE ISSUE IN:', fullPath);
                }
            }
        }
    }
}

checkDir('src');
