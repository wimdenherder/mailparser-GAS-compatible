'use strict';

const fs = require('fs');
const MailParser = require('../lib/mail-parser');

const mailpath = ""; // <-- write your filename here

let parser = new MailParser();
let input = fs.createReadStream(mailpath);
let mailobj = {
    attachments: [],
    text: {}
};

parser.on('headers', headers => {
    let headerObj = {};
    for (let [k, v] of headers) {
        // We don’t escape the key '__proto__'
        // which can cause problems on older engines
        headerObj[k] = v;
    }

    mailobj.headers = headerObj;
});

parser.on('data', data => {
    if (data.type === 'attachment') {
        mailobj.attachments.push(data);
        data.content.on('readable', () => data.content.read());
        data.content.on('end', () => data.release());
    } else {
        mailobj.text = data;
    }
});

parser.on('end', () => {
    console.log(JSON.stringify(mailobj, (k, v) => (k === 'content' || k === 'release' ? undefined : v), 3));
});
input.pipe(parser);
