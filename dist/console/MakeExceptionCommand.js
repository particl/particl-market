"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * MakeExceptionCommand
 * -------------------------------------
 *
 */
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
class MakeExceptionCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor() {
        super(...arguments);
        this.type = 'Exception';
        this.suffix = 'Exception';
        this.template = 'exception.hbs';
        this.target = 'api/exceptions';
    }
}
MakeExceptionCommand.command = 'make:exception';
MakeExceptionCommand.description = 'Generate new exception';
exports.MakeExceptionCommand = MakeExceptionCommand;
//# sourceMappingURL=MakeExceptionCommand.js.map