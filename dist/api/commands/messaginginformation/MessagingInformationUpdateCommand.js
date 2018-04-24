"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
const MessagingInformationService_1 = require("../../services/MessagingInformationService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const MessageException_1 = require("../../exceptions/MessageException");
const _ = require("lodash");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let MessagingInformationUpdateCommand = class MessagingInformationUpdateCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemTemplateService, messagingInformationService) {
        super(CommandEnumType_1.Commands.MESSAGINGINFORMATION_UPDATE);
        this.Logger = Logger;
        this.listingItemTemplateService = listingItemTemplateService;
        this.messagingInformationService = messagingInformationService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     *  [1]: protocol (MessagingProtocolType)
     *  [2]: public key
     *
     * @param data
     * @returns {Promise<MessagingInformation>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // messaging information cannot be updated if there's a ListingItem related to ListingItemTemplate.
            // (the item has allready been posted)
            const listingItemTemplateModel = yield this.listingItemTemplateService.findOne(data.params[0]);
            const listingItemTemplate = listingItemTemplateModel.toJSON();
            if (!_.isEmpty(listingItemTemplate.ListingItems)) {
                throw new MessageException_1.MessageException('MessagingInformation cannot be updated if there is a ListingItem related to ListingItemTemplate.');
            }
            else {
                // todo: updates only the first one
                return this.messagingInformationService.update(listingItemTemplate.MessagingInformation[0].id, {
                    listing_item_template_id: data.params[0],
                    protocol: data.params[1],
                    publicKey: data.params[2]
                });
            }
        });
    }
    usage() {
        return this.getName() + ' <listingTemplateId> <protocol> <publicKey> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>      - Numeric - [TODO] \n'
            + '    <protocol>               - ENUM{SMSG} - [TODO] \n'
            + '    <publicKey>              - String - [TODO] ';
    }
    description() {
        return 'Update the details of messaging information associated with listingTemplateId.';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], MessagingInformationUpdateCommand.prototype, "execute", null);
MessagingInformationUpdateCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.MessagingInformationService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemTemplateService_1.ListingItemTemplateService,
        MessagingInformationService_1.MessagingInformationService])
], MessagingInformationUpdateCommand);
exports.MessagingInformationUpdateCommand = MessagingInformationUpdateCommand;
//# sourceMappingURL=MessagingInformationUpdateCommand.js.map