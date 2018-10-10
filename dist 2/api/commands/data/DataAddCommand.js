"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const RpcCommandFactory_1 = require("../../factories/RpcCommandFactory");
const TestDataService_1 = require("../../services/TestDataService");
const MessageException_1 = require("../../exceptions/MessageException");
let DataAddCommand = class DataAddCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, testDataService) {
        super(CommandEnumType_1.Commands.DATA_ADD);
        this.Logger = Logger;
        this.testDataService = testDataService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: CreatableModel, model to generate
     *  [1]: json
     *  [2]: withRelated, return full objects or just id's
     *
     * @param data
     * @param rpcCommandFactory
     */
    execute(data, rpcCommandFactory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const withRelated = data.params[2] ? data.params[2] : true;
            return yield this.testDataService.create({
                model: data.params[0],
                data: JSON.parse(data.params[1]),
                withRelated
            });
        });
    }
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 1) {
                throw new MessageException_1.MessageException('Missing model.');
            }
            if (data.params.length < 2) {
                throw new MessageException_1.MessageException('Missing json.');
            }
            return data;
        });
    }
    usage() {
        return this.getName() + ' <model> <json> [<withRelated>] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <model>                  - ENUM{listingitemtemplate|listingitem|profile|itemcategory \n'
            + '                                |favoriteitem|iteminformation|bid|paymentinformation|itemimage} \n'
            + '                                - The type of data we want to generate. \n'
            + '    <json>                   - String - json for the object to add. \n'
            + '    <withRelated>            - [optional] Boolean - Whether to return full objects or just id. ';
    }
    description() {
        return 'Adds data to the database.';
    }
    example() {
        return 'data add profile \'{"name":"someChangeFoundBetweenTwoCouchSeats","address":"1EBHA1ckUWzNKN7BMfDwGTx6GKEbADUozX"}\'';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest, RpcCommandFactory_1.RpcCommandFactory]),
    tslib_1.__metadata("design:returntype", Promise)
], DataAddCommand.prototype, "execute", null);
DataAddCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.TestDataService)),
    tslib_1.__metadata("design:paramtypes", [Object, TestDataService_1.TestDataService])
], DataAddCommand);
exports.DataAddCommand = DataAddCommand;
//# sourceMappingURL=DataAddCommand.js.map