"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ItemInformationService_1 = require("../../services/ItemInformationService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ItemInformationGetCommand = class ItemInformationGetCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, itemInformationService) {
        super(CommandEnumType_1.Commands.ITEMINFORMATION_GET);
        this.Logger = Logger;
        this.itemInformationService = itemInformationService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *
     * @param data
     * @returns {Promise<ItemInformation>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.itemInformationService.findByItemTemplateId(data.params[0]);
        });
    }
    usage() {
        return this.getName() + ' <listingItemTemplateId> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>       - Numeric - The listingItemTemplateId of the item information we want \n'
            + '                                     to retrieve.';
    }
    description() {
        return 'Get an iteminformations and associated with it with a listingItemTemplateId.';
    }
    example() {
        return 'information ' + this.getName() + ' 1';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemInformationGetCommand.prototype, "execute", null);
ItemInformationGetCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemInformationService)),
    tslib_1.__metadata("design:paramtypes", [Object, ItemInformationService_1.ItemInformationService])
], ItemInformationGetCommand);
exports.ItemInformationGetCommand = ItemInformationGetCommand;
//# sourceMappingURL=ItemInformationGetCommand.js.map