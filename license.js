const glob = require('glob');
const fs = require('sync-fs');
const prepend = require('prepend');

const date = new Date();
const particlMarket = '// Copyright (c) 2017-' + String(date.getFullYear()) + ', The Particl Market developers';
const underLicense = '// Distributed under the GPL software license, see the accompanying';
const licenseLink = '// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE';

function getFiles(filePath) {
    console.log(filePath);
    let filenames = glob.sync(filePath + '{src,test}/**/*.ts', {nodir: true, ignore: filePath + 'data/**'});
    console.log(filenames);
    return filenames;
}

function update(filename) {
    try {
        let file = String(fs.readFile(filename));
        if (file.indexOf('// Copyright (c) 2017-') < 0) {
            return;
        }
        let lines = file.split('\n');
        lines.shift();
        lines.unshift(particlMarket);
        file = lines.join('\n');
        fs.writeFile(filename, file);
    } catch (error) {
        console.error(error);
    }
}

function add(filename) {
    try {
        let file = fs.readFile(filename);
        if (file.indexOf('// Copyright (c) 2017-') >= 0) {
            return;
        }
    } catch (error) {
        console.error(error);
    }
    prepend(filename, particlMarket + '\n' + underLicense + '\n' + licenseLink + '\n', function(error) {
        if (error) console.error(error.message);
    });
}

function run(updateMethod, filePath) {
    let filenames = getFiles(filePath ? filePath : '');
    for (filename of filenames) {
        if (updateMethod == 'add') {
            add(filename);
        } else {
            update(filename);
        }
    }
}

run(process.argv[2], process.argv[3]);
