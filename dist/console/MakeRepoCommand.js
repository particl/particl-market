"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * MakeRepoCommand
 * -------------------------------------
 *
 */
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
class MakeRepoCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor() {
        super(...arguments);
        this.type = 'Repository';
        this.suffix = 'Repository';
        this.template = 'repository.hbs';
        this.target = 'api/repositories';
    }
}
MakeRepoCommand.command = 'make:repo';
MakeRepoCommand.description = 'Generate new repository';
exports.MakeRepoCommand = MakeRepoCommand;
//# sourceMappingURL=MakeRepoCommand.js.map