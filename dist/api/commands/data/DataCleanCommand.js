"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const TestDataService_1 = require("../../services/TestDataService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let DataCleanCommand = class DataCleanCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, testDataService) {
        super(CommandEnumType_1.Commands.DATA_CLEAN);
        this.Logger = Logger;
        this.testDataService = testDataService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  none
     *
     * @param {RpcRequest} data
     * @returns {Promise<void>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.testDataService.clean();
        });
    }
    usage() {
        return this.getName() + ' ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n';
    }
    description() {
        return 'Cleans database, inserts default data.';
    }
    example() {
        return 'data ' + this.getName();
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], DataCleanCommand.prototype, "execute", null);
DataCleanCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.TestDataService)),
    tslib_1.__metadata("design:paramtypes", [Object, TestDataService_1.TestDataService])
], DataCleanCommand);
exports.DataCleanCommand = DataCleanCommand;
//# sourceMappingURL=DataCleanCommand.js.map