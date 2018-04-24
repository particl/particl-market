"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * MakeControllerCommand
 * -------------------------------------
 *
 */
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
class MakeControllerCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor() {
        super(...arguments);
        this.type = 'Controller';
        this.suffix = 'Controller';
        this.template = 'controller.hbs';
        this.target = 'api/controllers';
    }
}
MakeControllerCommand.command = 'make:controller';
MakeControllerCommand.description = 'Generate new controller';
exports.MakeControllerCommand = MakeControllerCommand;
//# sourceMappingURL=MakeControllerCommand.js.map