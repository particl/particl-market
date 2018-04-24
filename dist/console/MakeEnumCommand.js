"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * MakeEnumCommand
 * -------------------------------------
 *
 */
const _ = require("lodash");
const inquirer = require("inquirer");
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
class MakeEnumCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor() {
        super(...arguments);
        this.type = 'Enum';
        this.suffix = '';
        this.template = 'enum.hbs';
        this.target = 'api/enums';
        this.updateTargets = false;
    }
    run() {
        const _super = name => super[name];
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield _super("run").call(this);
            const metaData = yield this.askMetaData(this.context);
            this.context = Object.assign({}, (this.context || {}), metaData);
            if (this.context.hasProperties && !this.context.properties) {
                this.context.properties = yield this.askProperties(this.context.name);
            }
        });
    }
    write() {
        const _super = name => super[name];
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Create model
            yield _super("write").call(this);
        });
    }
    askMetaData(context) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const prompt = inquirer.createPromptModule();
            const prompts = yield prompt([
                {
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
    askProperties(name) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
                        filter: (value) => value.toUpperCase()
                    }, {
                        type: 'list',
                        name: 'type',
                        message: 'Property type:',
                        when: (res) => {
                            askAgain = !!res['name'];
                            return askAgain;
                        },
                        choices: [
                            'string (string)'
                            // TODO: 'integer (number)'
                        ]
                    }
                ]);
                if (askAgain) {
                    console.log('');
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
    }
}
MakeEnumCommand.command = 'make:enum';
MakeEnumCommand.description = 'Generate new enum';
exports.MakeEnumCommand = MakeEnumCommand;
//# sourceMappingURL=MakeEnumCommand.js.map