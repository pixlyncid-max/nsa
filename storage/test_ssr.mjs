import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'fs';

// Read props from storage/page.json
const pageData = JSON.parse(fs.readFileSync('storage/page.json', 'utf8'));
console.log('Component to render:', pageData.component);
console.log('Props keys:', Object.keys(pageData.props));

try {
    // We will test if we can import and render Index
    console.log('Starting render test...');
} catch (e) {
    console.error('Error during test setup:', e);
}

