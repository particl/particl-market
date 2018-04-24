"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * MakeCommandCommand
 * -------------------------------------
 *
 */
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
class MakeCommandCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor() {
        super(...arguments);
        this.type = 'Command';
        this.suffix = 'Command';
        this.template = 'command.hbs';
        this.target = 'api/commands';
        this.updateTargets = true;
    }
    run() {
        const _super = name => super[name];
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield _super("run").call(this);
        });
    }
}
MakeCommandCommand.command = 'make:command';
MakeCommandCommand.description = 'Generate new command';
exports.MakeCommandCommand = MakeCommandCommand;
//# sourceMappingURL=MakeCommandCommand.js.map