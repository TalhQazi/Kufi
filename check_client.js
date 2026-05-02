const https = require('https');

https.get('https://kufitravel.com', (res) => {
    let html = '';
    res.on('data', c => html += c);
    res.on('end', () => {
        const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
        if (match) {
            console.log('Found JS file:', match[1]);
            https.get('https://kufitravel.com' + match[1], (jsRes) => {
                let js = '';
                jsRes.on('data', c => js += c);
                jsRes.on('end', () => {
                    if (js.includes('743890225363-pr9r6au986adjl1ed6of1up2ffd6qli1')) {
                        console.log('REAL CLIENT ID FOUND!');
                    } else if (js.includes('YOUR_GOOGLE_CLIENT_ID')) {
                        console.log('DEFAULT CLIENT ID STILL FOUND!');
                    } else {
                        console.log('COULD NOT FIND ANY CLIENT ID');
                    }
                });
            });
        } else {
            console.log('Could not find JS file in HTML');
        }
    });
});
