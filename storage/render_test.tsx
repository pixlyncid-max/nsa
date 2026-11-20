import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'fs';

// Mock Inertia usePage
const pageData = JSON.parse(fs.readFileSync('storage/page.json', 'utf8'));

// Setup global window and document if needed
global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    confirm: () => true,
    location: { href: '' },
} as any;
global.document = {
    getElementById: () => null,
    querySelector: () => null,
} as any;

// We need to mock @inertiajs/react
import * as inertia from '@inertiajs/react';
(inertia as any).usePage = () => ({
    props: {
        ...pageData.props,
        auth: {
            user: {
                id: 1,
                name: 'Budi Pratama',
                email: 'anggota@ifaa.test',
                role: 'user',
            }
        }
    }
});

import Index from '../resources/js/Pages/Member/Register/Index';

try {
    const html = renderToString(React.createElement(Index, pageData.props));
    console.log('Render SUCCESS! Length:', html.length);
} catch (err) {
    console.error('RENDER ERROR:', err);
}

