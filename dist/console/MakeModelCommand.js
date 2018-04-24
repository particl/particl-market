"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * MakeModelCommand
 * -------------------------------------
 *
 */
const _ = require("lodash");
const inquirer = require("inquirer");
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
const MakeMigrationCommand_1 = require("./MakeMigrationCommand");
const utils_1 = require("./lib/utils");
const template_1 = require("./lib/template");
class MakeModelCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor() {
        super(...arguments);
        this.type = 'Model';
        this.suffix = '';
        this.template = 'model.hbs';
        this.target = 'api/models';
    }
    run() {
        const _super = name => super[name];
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield _super("run").call(this);
            const metaData = yield this.askMetaData(this.context);
            this.context = Object.assign({}, (this.context || {}), metaData);
            if (this.context.hasProperties && !this.context.properties) {
                this.context.properties = yield utils_1.askProperties(this.context);
            }
            if (this.context.hasMigration) {
                this.makeMigrationCommand = new MakeMigrationCommand_1.MakeMigrationCommand(this.context);
                yield this.makeMigrationCommand.run();
            }
        });
    }
    write() {
        const _super = name => super[name];
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Create migration file
            if (this.context.hasMigration) {
                yield this.makeMigrationCommand.write();
            }
            // Create model
            yield _super("write").call(this);
            // Create interface for this resource object
            const filePath = utils_1.buildFilePath('types/resources', this.context.name.camelCase, false, '.d.ts');
            yield utils_1.existsFile(filePath, true);
            yield template_1.writeTemplate('resource.hbs', filePath, this.context);
        });
    }
    askMetaData(context) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const prompt = inquirer.createPromptModule();
            const prompts = yield prompt([
                {
                    type: 'input',
                    name: 'tableName',
                    message: 'Enter the table-name:',
                    filter: (value) => _.snakeCase(value),
                    validate: (value) => !!value
                }, {
                    type: 'confirm',
                    name: 'hasTimestamps',
                    message: 'Has timestamps?',
                    default: true
                }, {
                    type: 'confirm',
                    name: 'hasMigration',
                    message: 'Add migration?',
                    default: true
                }, {
                    type: 'confirm',
                    name: 'hasProperties',
                    message: 'Do you want to add some properties?',
                    default: true,
                    when: () => !this.context.properties
                }
            ]);
            return _.assign(context, prompts);
        });
    }
}
MakeModelCommand.command = 'make:model';
MakeModelCommand.description = 'Generate new model';
exports.MakeModelCommand = MakeModelCommand;
//# sourceMappingURL=MakeModelCommand.js.map