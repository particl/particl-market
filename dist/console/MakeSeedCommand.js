"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * MakeSeedCommand
 * -------------------------------------
 *
 */
const _ = require("lodash");
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
class MakeSeedCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor() {
        super(...arguments);
        this.target = 'database/seeds';
        this.type = 'Seed';
        this.suffix = '';
        this.template = 'seed.hbs';
        this.updateTargets = false;
    }
    parseName(suffix = '', prefix = '') {
        return (name) => {
            return _.snakeCase(name);
        };
    }
}
MakeSeedCommand.command = 'make:seed';
MakeSeedCommand.description = 'Generate new seed';
exports.MakeSeedCommand = MakeSeedCommand;
//# sourceMappingURL=MakeSeedCommand.js.map