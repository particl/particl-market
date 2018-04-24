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
const _ = require("lodash");
const MessageException_1 = require("../../exceptions/MessageException");
let ListingItemTemplateRemoveCommand = class ListingItemTemplateRemoveCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemTemplateService) {
        super(CommandEnumType_1.Commands.TEMPLATE_REMOVE);
        this.Logger = Logger;
        this.listingItemTemplateService = listingItemTemplateService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // check and find that listingItemTemplate is not related with any listingItem
            const listingItemTemplateModel = yield this.listingItemTemplateService.findOne(data.params[0]);
            const listingItemTemplate = listingItemTemplateModel.toJSON();
            this.log.debug('remove template: ', data.params[0]);
            this.log.debug('listingItemTemplate.ListingItems: ', listingItemTemplate.ListingItems.length);
            this.log.debug('_.isEmpty(listingItemTemplate.ListingItems): ', _.isEmpty(listingItemTemplate.ListingItems));
            if (!_.isEmpty(listingItemTemplate.ListingItems)) {
                throw new MessageException_1.MessageException(`ListingItemTemplate has ListingItems so it can't be deleted. id=${data.params[0]}`);
            }
            return yield this.listingItemTemplateService.destroy(data.params[0]);
        });
    }
    usage() {
        return this.getName() + ' <listingTemplateId> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - Numeric - The ID of the listing item template that we \n'
            + '                                     want to destroy. ';
    }
    description() {
        return 'Destroy a listing item template specified by the ID of the listing item template and it will destroy all its relations as well.';
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
], ListingItemTemplateRemoveCommand.prototype, "execute", null);
ListingItemTemplateRemoveCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemTemplateService_1.ListingItemTemplateService])
], ListingItemTemplateRemoveCommand);
exports.ListingItemTemplateRemoveCommand = ListingItemTemplateRemoveCommand;
//# sourceMappingURL=ListingItemTemplateRemoveCommand.js.map