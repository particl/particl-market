"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ListingItemService_1 = require("../../services/ListingItemService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ListingItemGetCommand = class ListingItemGetCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemService) {
        super(CommandEnumType_1.Commands.ITEM_GET);
        this.Logger = Logger;
        this.listingItemService = listingItemService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: id or hash
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let listingItem;
            if (typeof data.params[0] === 'number') {
                listingItem = yield this.listingItemService.findOne(data.params[0]);
            }
            else {
                listingItem = yield this.listingItemService.findOneByHash(data.params[0]);
            }
            return listingItem;
        });
    }
    usage() {
        return this.getName() + ' [<listingItemId>|<hash>] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemId>          - [optional] Numeric - The ID of the listing item we want to retrieve. \n'
            + '    <hash>                   - [optional] String - The hash of the listing item we want to retrieve. ';
    }
    description() {
        return 'Get a listing item via listingItemId or hash.';
    }
    example() {
        return 'item ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemGetCommand.prototype, "execute", null);
ListingItemGetCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemService_1.ListingItemService])
], ListingItemGetCommand);
exports.ListingItemGetCommand = ListingItemGetCommand;
//# sourceMappingURL=ListingItemGetCommand.js.map