"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * AbstractMakeCommand
 * -------------------------------------
 *
 */
const _ = require("lodash");
const path = require("path");
const inquirer = require("inquirer");
const template_1 = require("./template");
const utils_1 = require("./utils");
class AbstractMakeCommand {
    constructor(context) {
        this.type = 'Type';
        this.suffix = 'Suffix';
        this.prefix = '';
        this.template = 'template.hbs';
        this.target = 'api/target/path';
        this.updateTargets = true;
        this.isTest = false;
        this.buildFilePath = (targetPath, fileName, isTest = false, extension = '.ts') => {
            if (isTest) {
                return path.join(__dirname, `/../../../test${targetPath}`, `${fileName}${extension}`);
            }
            else {
                return path.join(__dirname, `/../../${targetPath}`, `${fileName}${extension}`);
            }
        };
        this.context = _.cloneDeep(context);
    }
    static action(command) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield command.run();
                yield command.write();
                if (command.updateTargets) {
                    yield utils_1.updateTargets();
                }
                process.exit(0);
            }
            catch (e) {
                process.exit(1);
            }
        });
    }
    run() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.context = yield this.askFileName(this.context, this.type, this.suffix, this.prefix);
        });
    }
    write() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const filePath = this.buildFilePath(this.target, this.context.name, this.isTest);
            yield utils_1.existsFile(filePath, true, this.isTest);
            this.context.name = utils_1.parseName(this.context.name, this.suffix);
            yield template_1.writeTemplate(this.template, filePath, this.context);
        });
    }
    parseName(suffix = '', prefix = '') {
        return (name) => {
            let ns = name.split('/');
            ns = ns.map((v) => _.camelCase(v));
            ns[ns.length - 1] = _.upperFirst(ns[ns.length - 1]);
            return (ns.join('/')) + prefix + suffix;
        };
    }
    askFileName(context, name, suffix, prefix) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const nameParser = this.parseName(suffix, prefix);
            if (context === undefined || context.name === undefined) {
                const prompt = inquirer.createPromptModule();
                context = yield prompt([
                    {
                        type: 'input',
                        name: 'name',
                        message: `Enter the name of the ${name}:`,
                        filter: nameParser,
                        validate: utils_1.inputIsRequired
                    }
                ]);
                const amount = context.name.split('/').length - 1;
                context.deepness = '';
                _.times(amount, () => context.deepness += '../');
            }
            else {
                context.name = nameParser(context.name);
            }
            return context;
        });
    }
}
AbstractMakeCommand.command = 'make:command';
AbstractMakeCommand.description = 'description';
exports.AbstractMakeCommand = AbstractMakeCommand;
//# sourceMappingURL=AbstractMakeCommand.js.map