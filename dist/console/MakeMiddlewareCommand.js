"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * MakeMiddlewareCommand
 * -------------------------------------
 *
 */
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
class MakeMiddlewareCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor() {
        super(...arguments);
        this.type = 'Middleware';
        this.suffix = 'Middleware';
        this.template = 'middleware.hbs';
        this.target = 'api/middlewares';
    }
}
MakeMiddlewareCommand.command = 'make:middleware';
MakeMiddlewareCommand.description = 'Generate new middleware';
exports.MakeMiddlewareCommand = MakeMiddlewareCommand;
//# sourceMappingURL=MakeMiddlewareCommand.js.map