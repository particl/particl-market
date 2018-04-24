"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * MakeServiceCommand
 * -------------------------------------
 *
 */
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
class MakeServiceCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor() {
        super(...arguments);
        this.type = 'Service';
        this.suffix = 'Service';
        this.template = 'service.hbs';
        this.target = 'api/services';
    }
}
MakeServiceCommand.command = 'make:service';
MakeServiceCommand.description = 'Generate new service';
exports.MakeServiceCommand = MakeServiceCommand;
//# sourceMappingURL=MakeServiceCommand.js.map