"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * MakeRequestCommand
 * -------------------------------------
 *
 */
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
class MakeRequestCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor(context, prefix) {
        super(context);
        this.type = 'Request';
        this.suffix = 'Request';
        this.prefix = '';
        this.template = 'request.hbs';
        this.target = 'api/requests';
        this.prefix = prefix || '';
    }
}
MakeRequestCommand.command = 'make:request';
MakeRequestCommand.description = 'Generate new request';
exports.MakeRequestCommand = MakeRequestCommand;
//# sourceMappingURL=MakeRequestCommand.js.map