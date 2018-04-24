"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const EscrowService_1 = require("../../services/EscrowService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
const MessageException_1 = require("../../exceptions/MessageException");
let EscrowAddCommand = class EscrowAddCommand extends BaseCommand_1.BaseCommand {
    constructor(escrowService, listingItemTemplateService, Logger) {
        super(CommandEnumType_1.Commands.ESCROW_ADD);
        this.escrowService = escrowService;
        this.listingItemTemplateService = listingItemTemplateService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     *  [1]: escrowtype
     *  [2]: buyer ratio
     *  [3]: seller ratio
     * @param data
     * @returns {Promise<Escrow>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // get the template
            const listingItemTemplateId = data.params[0];
            const listingItemTemplateModel = yield this.listingItemTemplateService.findOne(listingItemTemplateId);
            const listingItemTemplate = listingItemTemplateModel.toJSON();
            // template allready has listingitems so for now, it cannot be modified
            if (listingItemTemplate.ListingItems.length > 0) {
                throw new MessageException_1.MessageException(`Escrow cannot be added because ListingItems allready exist for the ListingItemTemplate.`);
            }
            // creates an Escrow related to PaymentInformation related to ListingItemTemplate
            return this.escrowService.create({
                payment_information_id: listingItemTemplate.PaymentInformation.id,
                type: data.params[1],
                ratio: {
                    buyer: data.params[2],
                    seller: data.params[3]
                }
            });
        });
    }
    usage() {
        return this.getName() + ' <listingItemTemplateId> <escrowType> <buyerRatio> <sellerRatio> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <listingItemTemplateId>  - Numeric - The ID of the listing item template we want \n'
            + '                                to associate with this escrow. \n'
            + '    <escrowType>             - Enum{NOP,MAD} - The type of the escrow we want to \n'
            + '                                create. \n'
            + '    <buyerRatio>             - Numeric - [TODO] \n'
            + '    <sellerRatio>            - Numeric - [TODO] ';
    }
    description() {
        return 'Create an escrow and associate it with a listingItemTemplate.';
    }
    example() {
        return 'escrow ' + this.getName() + ' 1 MAD 1 1 ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], EscrowAddCommand.prototype, "execute", null);
EscrowAddCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.EscrowService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [EscrowService_1.EscrowService,
        ListingItemTemplateService_1.ListingItemTemplateService, Object])
], EscrowAddCommand);
exports.EscrowAddCommand = EscrowAddCommand;
//# sourceMappingURL=EscrowAddCommand.js.map