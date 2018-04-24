"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const handlebars = require("handlebars");
exports.loadTemplate = (file, stop = false) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, `../templates/${file}`), { encoding: 'utf-8' }, (err, content) => {
            if (err) {
                console.log(err);
                if (stop) {
                    process.exit(1);
                }
                return reject(err);
            }
            resolve(content);
        });
    });
});
exports.writeTemplate = (tempFile, filePath, context) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    yield syncFolder(filePath);
    yield syncTemplate(filePath, tempFile, context);
});
const syncFolder = (filePath) => {
    return new Promise((resolve, reject) => {
        mkdirp(path.dirname(filePath), (err) => {
            if (err) {
                if (stop) {
                    console.log(err);
                    process.exit(1);
                }
                return reject(err);
            }
            resolve();
        });
    });
};
const syncTemplate = (filePath, tempFile, context) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const template = yield exports.loadTemplate(tempFile);
    const content = handlebars.compile(template)(context);
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, (err) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve();
        });
    });
});
//# sourceMappingURL=template.js.map