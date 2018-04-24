"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * MakeFactoryCommand
 * -------------------------------------
 *
 */
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
class MakeFactoryCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor() {
        super(...arguments);
        this.type = 'Factory';
        this.suffix = 'Factory';
        this.template = 'factory.hbs';
        this.target = 'api/factories';
        this.updateTargets = true;
    }
    run() {
        const _super = name => super[name];
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield _super("run").call(this);
        });
    }
}
MakeFactoryCommand.command = 'make:factory';
MakeFactoryCommand.description = 'Generate new factory';
exports.MakeFactoryCommand = MakeFactoryCommand;
//# sourceMappingURL=MakeFactoryCommand.js.map