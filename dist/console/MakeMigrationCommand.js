"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * MakeMigrationCommand
 * -------------------------------------
 *
 */
const _ = require("lodash");
const inquirer = require("inquirer");
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
const utils_1 = require("./lib/utils");
class MakeMigrationCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor() {
        super(...arguments);
        this.target = 'database/migrations';
        this.type = 'Migration';
        this.suffix = '';
        this.template = 'migration.hbs';
        this.updateTargets = false;
    }
    run() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.context && this.context.tableName) {
                this.context.name = `${this.getTimestamp()}_create_${_.snakeCase(this.context.tableName)}_table`;
            }
            else {
                const prompt = inquirer.createPromptModule();
                const prompts = yield prompt([
                    {
                        type: 'input',
                        name: 'name',
                        message: `Enter the name of the ${this.type}:`,
                        filter: v => _.snakeCase(v),
                        validate: utils_1.inputIsRequired
                    }
                ]);
                this.context = Object.assign({}, (this.context || {}), prompts);
                this.context.name = `${this.getTimestamp()}_${prompts.name}`;
            }
        });
    }
    getTimestamp() {
        const today = new Date();
        const formatNumber = (n) => (n < 10) ? `0${n}` : `${n}`;
        let timestamp = `${today.getFullYear()}`;
        timestamp += `${formatNumber(today.getMonth())}`;
        timestamp += `${formatNumber(today.getDay())}`;
        timestamp += `${formatNumber(today.getHours())}`;
        timestamp += `${formatNumber(today.getMinutes())}`;
        timestamp += `${formatNumber(today.getSeconds())}`;
        return timestamp;
    }
}
MakeMigrationCommand.command = 'make:migration';
MakeMigrationCommand.description = 'Generate new migration';
exports.MakeMigrationCommand = MakeMigrationCommand;
//# sourceMappingURL=MakeMigrationCommand.js.map