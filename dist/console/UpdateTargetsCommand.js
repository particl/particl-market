"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * UpdateTargetsCommand
 * -------------------------------------
 *
 * This script reads all the api files and generate the
 * needed ioc targets file.
 */
const path = require("path");
const _ = require("lodash");
const glob = require("glob");
const handlebars = require("handlebars");
const AbstractCommand_1 = require("./lib/AbstractCommand");
const template_1 = require("./lib/template");
const utils_1 = require("./lib/utils");
class UpdateTargetsCommand extends AbstractCommand_1.AbstractCommand {
    constructor() {
        super(...arguments);
        this.template = 'targets.hbs';
        this.targetFile = 'Targets.ts';
    }
    run() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const files = yield this.getFiles();
            let context = {};
            files.forEach((filePath) => {
                const obj = this.divideFilePath(filePath);
                const tmpContext = {};
                tmpContext[obj.key] = this.parseFilePath(obj.path);
                context = _.merge(context, tmpContext);
            });
            handlebars.registerHelper('object', (c) => {
                let json = JSON.stringify(c, null, 4) || '{}';
                let jsonLines = json.split('\n');
                jsonLines = jsonLines.map(line => `    ${line}`);
                json = jsonLines.join('\n');
                return json.replace(/\"([^(\")"]+)\":/g, '$1:').replace(/"/g, '\'');
            });
            const filepath = path.join(__dirname.replace('console', 'constants'), this.targetFile);
            yield utils_1.existsFile(filepath, true);
            yield template_1.writeTemplate(this.template, filepath, context);
        });
    }
    getFiles() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const filepath = path.normalize(__dirname.replace('console', 'api'));
                glob(`${path.join(filepath, '**', '*.ts')}`, (err, files) => {
                    if (err) {
                        return reject(err);
                    }
                    files = files
                        .map(f => path.normalize(f))
                        .map((f) => f.replace(filepath + path.sep, ''))
                        .map((f) => f.replace('.ts', ''));
                    resolve(files);
                });
            });
        });
    }
    divideFilePath(filePath) {
        const fs = filePath.split(path.sep);
        const key = fs[0];
        fs.splice(0, 1);
        return {
            key,
            path: fs.join(path.sep)
        };
    }
    parseFilePath(filePath) {
        if (filePath.indexOf(path.sep) !== -1) {
            const obj = this.divideFilePath(filePath);
            return {
                [obj.key]: this.parseFilePath(obj.path)
            };
        }
        else {
            return {
                [filePath]: filePath
            };
        }
    }
}
UpdateTargetsCommand.command = 'update:targets';
UpdateTargetsCommand.description = 'Generate new controller';
exports.UpdateTargetsCommand = UpdateTargetsCommand;
//# sourceMappingURL=UpdateTargetsCommand.js.map