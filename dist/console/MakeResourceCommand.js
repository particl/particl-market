"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * MakeResourceCommand
 * -------------------------------------
 *
 */
const utils_1 = require("./lib/utils");
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
const MakeModelCommand_1 = require("./MakeModelCommand");
const MakeRepoCommand_1 = require("./MakeRepoCommand");
const MakeServiceCommand_1 = require("./MakeServiceCommand");
// import { MakeControllerCommand } from './MakeControllerCommand';
const MakeRequestCommand_1 = require("./MakeRequestCommand");
const MakeIntegrationTestCommand_1 = require("./MakeIntegrationTestCommand");
const MakeCommandCommand_1 = require("./MakeCommandCommand");
class MakeResourceCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor() {
        super(...arguments);
        this.type = 'Resource';
        this.suffix = '';
        this.prefix = '';
    }
    run() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.context = yield this.askFileName(this.context, this.type, this.suffix, this.prefix);
            this.context.properties = yield utils_1.askProperties(this.context.name);
            this.context.hasProperties = true;
            this.context.isResourceTemplate = true;
            // Get commands
            this.makeModelCommand = new MakeModelCommand_1.MakeModelCommand(this.context);
            this.makeRepoCommand = new MakeRepoCommand_1.MakeRepoCommand(this.context);
            this.makeServiceCommand = new MakeServiceCommand_1.MakeServiceCommand(this.context);
            // this.makeControllerCommand = new MakeControllerCommand(this.context);
            this.makeCreateRequestCommand = new MakeRequestCommand_1.MakeRequestCommand(this.context, 'Create');
            this.makeUpdateRequestCommand = new MakeRequestCommand_1.MakeRequestCommand(this.context, 'Update');
            this.makeIntegrationTestCommand = new MakeIntegrationTestCommand_1.MakeIntegrationTestCommand(this.context);
            this.makeCommandCommand = new MakeCommandCommand_1.MakeCommandCommand(this.context);
            // Ask all meta-data
            yield this.makeModelCommand.run();
            yield this.makeRepoCommand.run();
            yield this.makeServiceCommand.run();
            // await this.makeControllerCommand.run();
            yield this.makeCreateRequestCommand.run();
            yield this.makeUpdateRequestCommand.run();
            yield this.makeIntegrationTestCommand.run();
            yield this.makeCommandCommand.run();
        });
    }
    write() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.makeModelCommand.write();
            yield this.makeRepoCommand.write();
            yield this.makeServiceCommand.write();
            // await this.makeControllerCommand.write();
            yield this.makeCreateRequestCommand.write();
            yield this.makeUpdateRequestCommand.write();
            yield this.makeIntegrationTestCommand.write();
            yield this.makeCommandCommand.write();
        });
    }
}
MakeResourceCommand.command = 'make:resource';
MakeResourceCommand.description = 'Generate a new resource';
exports.MakeResourceCommand = MakeResourceCommand;
//# sourceMappingURL=MakeResourceCommand.js.map