"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ListingItemTemplateGetCommand = class ListingItemTemplateGetCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemTemplateService) {
        super(CommandEnumType_1.Commands.TEMPLATE_GET);
        this.Logger = Logger;
        this.listingItemTemplateService = listingItemTemplateService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: id or hash
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let listingItemTemplate;
            if (typeof data.params[0] === 'number') {
                listingItemTemplate = yield this.listingItemTemplateService.findOne(data.params[0]);
            }
            else {
                listingItemTemplate = yield this.listingItemTemplateService.findOneByHash(data.params[0]);
            }
            return listingItemTemplate;
        });
    }
    usage() {
        return this.getName() + ' <listingTemplateId> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - Numeric - The ID of the listing item template that we \n'
            + '                                     want to retrieve. ';
    }
    description() {
        return 'Get listing item template via listingItemTemplateId.';
    }
    example() {
        return 'template ' + this.getName() + ' 1';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemTemplateGetCommand.prototype, "execute", null);
ListingItemTemplateGetCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemTemplateService_1.ListingItemTemplateService])
], ListingItemTemplateGetCommand);
exports.ListingItemTemplateGetCommand = ListingItemTemplateGetCommand;
//# sourceMappingURL=ListingItemTemplateGetCommand.js.map