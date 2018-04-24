"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const inquirer = require("inquirer");
const pluralize = require("pluralize");
const UpdateTargetsCommand_1 = require("../UpdateTargetsCommand");
exports.parseName = (name, suffix) => ({
    camelCase: _.camelCase(exports.removeSuffix(suffix, name)),
    snakeCase: _.snakeCase(exports.removeSuffix(suffix, name)),
    capitalize: _.upperFirst(_.camelCase(exports.removeSuffix(suffix, name))),
    lowerCase: _.lowerCase(exports.removeSuffix(suffix, name)),
    kebabCase: _.kebabCase(exports.removeSuffix(suffix, name)),
    pluralize: pluralize(_.kebabCase(exports.removeSuffix(suffix, name))),
    normal: name
});
exports.removeSuffix = (suffix, value) => {
    return value.replace(suffix, '');
};
exports.filterInput = (suffix, prefix = '') => (value) => {
    if (value.indexOf('/') < 0) {
        return value;
    }
    let vs = value.split('/');
    vs = vs.map((v) => _.camelCase(v));
    vs[vs.length - 1] = _.capitalize(vs[vs.length - 1]);
    return (vs.join('/')) + prefix + suffix;
};
exports.buildFilePath = (targetPath, fileName, isTest = false, extension = '.ts') => {
    if (isTest) {
        return path.join(__dirname, `/../../../test/${targetPath}`, `${fileName}.test${extension}`);
    }
    else {
        return path.join(__dirname, `/../../${targetPath}`, `${fileName}${extension}`);
    }
};
exports.inputIsRequired = (value) => !!value;
exports.existsFile = (filePath, stop = false, isTest = false) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const prompt = inquirer.createPromptModule();
    return new Promise((resolve, reject) => {
        fs.exists(filePath, (exists) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (exists) {
                let fileName = filePath.split(path.normalize('/src/'))[1];
                if (isTest) {
                    fileName = filePath.split(path.normalize('/test/'))[1];
                }
                const answer = yield prompt([
                    {
                        type: 'confirm',
                        name: 'override',
                        message: `Override "${path.join(isTest ? 'test' : 'src', fileName)}"?`,
                        default: true
                    }
                ]);
                if (answer.override) {
                    return resolve(exists);
                }
            }
            else {
                return resolve(exists);
            }
            if (stop) {
                process.exit(0);
            }
            reject();
        }));
    });
});
exports.updateTargets = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
    console.log('');
    const prompt = inquirer.createPromptModule();
    const answer = yield prompt([
        {
            type: 'confirm',
            name: 'generateTargets',
            message: 'Update IoC targets?',
            default: true
        }
    ]);
    if (answer.generateTargets === true) {
        const command = new UpdateTargetsCommand_1.UpdateTargetsCommand();
        yield command.run();
    }
});
exports.askProperties = (name) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    console.log('');
    console.log(`Let\'s add some ${name} properties now.`);
    console.log(`Enter an empty property name when done.`);
    console.log('');
    let askAgain = true;
    const fieldPrompt = inquirer.createPromptModule();
    const properties = [];
    while (askAgain) {
        const property = yield fieldPrompt([
            {
                type: 'input',
                name: 'name',
                message: 'Property name:',
                filter: (value) => _.camelCase(value)
            }, {
                type: 'list',
                name: 'type',
                message: 'Property type:',
                when: (res) => {
                    askAgain = !!res['name'];
                    return askAgain;
                },
                choices: [
                    'string (string)',
                    'text (string)',
                    'boolean (boolean)',
                    'integer (number)',
                    'bigInteger (number)',
                    'float (number)',
                    'decimal (number)',
                    'binary (number)',
                    'date (Date)',
                    'time (Date)',
                    'dateTime (Date)'
                ]
            }
        ]);
        if (askAgain) {
            console.log('');
            property.name = exports.parseName(property.name, '');
            properties.push(property);
        }
    }
    properties.map(p => {
        const types = p.type.replace(/[()]/g, '').split(' ');
        p.type = {
            script: types[1],
            database: types[0]
        };
        return p;
    });
    console.log('');
    return properties;
});
//# sourceMappingURL=utils.js.map