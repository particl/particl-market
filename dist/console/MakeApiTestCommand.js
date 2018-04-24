"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * MakeApiTestCommand
 * -------------------------------------
 *
 */
const AbstractMakeCommand_1 = require("./lib/AbstractMakeCommand");
const utils_1 = require("./lib/utils");
const template_1 = require("./lib/template");
class MakeApiTestCommand extends AbstractMakeCommand_1.AbstractMakeCommand {
    constructor() {
        super(...arguments);
        this.target = '/black-box';
        this.type = 'API Test';
        this.suffix = '';
        this.template = 'api-test.hbs';
        this.updateTargets = false;
        this.isTest = true;
    }
    run() {
        const _super = name => super[name];
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield _super("run").call(this);
        });
    }
    write() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const filePath = this.buildFilePath(this.target, this.context.name, this.isTest, '.test.ts');
            yield utils_1.existsFile(filePath, true, this.isTest);
            this.context.name = utils_1.parseName(this.context.name, this.suffix);
            yield template_1.writeTemplate(this.template, filePath, this.context);
        });
    }
}
MakeApiTestCommand.command = 'make:api-test';
MakeApiTestCommand.description = 'Generate new api test';
exports.MakeApiTestCommand = MakeApiTestCommand;
//# sourceMappingURL=MakeApiTestCommand.js.map