const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function run() {
    // 1. Get CSRF token
    const res1 = await request({
        hostname: '127.0.0.1',
        port: 8000,
        path: '/login',
        method: 'GET'
    });
    
    const setCookie = res1.headers['set-cookie'] || [];
    const cookies = setCookie.map(c => c.split(';')[0]).join('; ');
    const csrfMatch = res1.body.match(/name="_token"\s+value="([^"]+)"/) || res1.body.match(/"csrf-token"\s+content="([^"]+)"/);
    const token = csrfMatch ? csrfMatch[1] : '';
    
    console.log('CSRF Token:', token);
    console.log('Initial Cookies:', cookies);

    // 2. Post login
    const postData = new URLSearchParams({
        _token: token,
        email: 'anggota@ifaa.test',
        password: 'password'
    }).toString();

    const res2 = await request({
        hostname: '127.0.0.1',
        port: 8000,
        path: '/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'Cookie': cookies
        }
    }, postData);

    console.log('Login Status:', res2.statusCode);
    const authCookies = (res2.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ') || cookies;

    // 3. Get /akun/keanggotaan/daftar/informasi-akun
    const res3 = await request({
        hostname: '127.0.0.1',
        port: 8000,
        path: '/akun/keanggotaan/daftar/informasi-akun',
        method: 'GET',
        headers: {
            'Cookie': authCookies + '; ' + cookies
        }
    });

    console.log('Form page Status:', res3.statusCode);
    console.log('Location header:', res3.headers['location']);
    const fs = require('fs');
    fs.writeFileSync('storage/form_page.html', res3.body);
    console.log('Body length:', res3.body.length);

    const dataPageMatch = res3.body.match(/data-page="([^"]+)"/);
    if (dataPageMatch) {
        const decoded = Buffer.from(dataPageMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'), 'utf8').toString();
        fs.writeFileSync('storage/page_props_raw.json', decoded);
        console.log('Found data-page! Length:', decoded.length);
    } else {
        console.log('NO data-page found in body!');
    }
}

run().catch(console.error);
