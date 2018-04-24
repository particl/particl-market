"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ListingItemObjectService_1 = require("../../services/ListingItemObjectService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ListingItemObjectSearchCommand = class ListingItemObjectSearchCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemObjectService) {
        super(CommandEnumType_1.Commands.ITEMOBJECT_SEARCH);
        this.Logger = Logger;
        this.listingItemObjectService = listingItemObjectService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: searchString, string
     *
     * @param data
     * @returns {Promise<ListingItemObject>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.listingItemObjectService.search({
                searchString: data.params[0]
            });
        });
    }
    usage() {
        return this.getName() + ' <searchString> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <searchString>           - String - A string that is used to find listing items objects by\n'
            + '                                matching their type or description. ';
    }
    description() {
        return 'Search listing items objects by given string match with listing item object type or description.';
    }
    example() {
        return 'itemobject ' + this.getName() + ' \'rubber chicken with a pully in the middle\' ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemObjectSearchCommand.prototype, "execute", null);
ListingItemObjectSearchCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemObjectService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemObjectService_1.ListingItemObjectService])
], ListingItemObjectSearchCommand);
exports.ListingItemObjectSearchCommand = ListingItemObjectSearchCommand;
//# sourceMappingURL=ListingItemObjectSearchCommand.js.map