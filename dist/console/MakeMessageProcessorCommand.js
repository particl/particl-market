"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * MakeMessageProcessorCommand
 * -------------------------------------
 *
 */
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
class MakeMessageProcessorCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor() {
        super(...arguments);
        this.type = 'MessageProcessor';
        this.suffix = 'MessageProcessor';
        this.template = 'messageprocessor.hbs';
        this.target = 'api/messageprocessors';
        this.updateTargets = true;
    }
    run() {
        const _super = name => super[name];
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield _super("run").call(this);
        });
    }
}
MakeMessageProcessorCommand.command = 'make:messageprocessor';
MakeMessageProcessorCommand.description = 'Generate new messageprocessor';
exports.MakeMessageProcessorCommand = MakeMessageProcessorCommand;
//# sourceMappingURL=MakeMessageProcessorCommand.js.map