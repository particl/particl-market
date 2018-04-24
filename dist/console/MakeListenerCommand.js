"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * MakeListenerCommand
 * -------------------------------------
 *
 */
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
class MakeListenerCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor() {
        super(...arguments);
        this.type = 'Listener';
        this.suffix = 'Listener';
        this.template = 'listener.hbs';
        this.target = 'api/listeners';
    }
}
MakeListenerCommand.command = 'make:listener';
MakeListenerCommand.description = 'Generate new listener';
exports.MakeListenerCommand = MakeListenerCommand;
//# sourceMappingURL=MakeListenerCommand.js.map