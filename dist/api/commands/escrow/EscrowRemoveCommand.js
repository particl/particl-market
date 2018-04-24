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
const MessageException_1 = require("../../exceptions/MessageException");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
let EscrowRemoveCommand = class EscrowRemoveCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemTemplateService, escrowService) {
        super(CommandEnumType_1.Commands.ESCROW_REMOVE);
        this.Logger = Logger;
        this.listingItemTemplateService = listingItemTemplateService;
        this.escrowService = escrowService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
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
                throw new MessageException_1.MessageException(`Escrow cannot be deleted because ListingItems allready exist for the ListingItemTemplate.`);
            }
            return this.escrowService.destroy(data.params[0]);
        });
    }
    usage() {
        return this.getName() + ' <listingItemTemplateId> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <listingItemTemplateId>  - Numeric - The ID belonging to the listing item \n'
            + '                                template that the escrow we want to delete is \n'
            + '                                associated with. ';
    }
    description() {
        return 'Command for removing an escrow, identified by listingItemTemplateId.';
    }
    example() {
        return 'escrow ' + this.getName() + ' 1 ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], EscrowRemoveCommand.prototype, "execute", null);
EscrowRemoveCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.EscrowService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemTemplateService_1.ListingItemTemplateService,
        EscrowService_1.EscrowService])
], EscrowRemoveCommand);
exports.EscrowRemoveCommand = EscrowRemoveCommand;
//# sourceMappingURL=EscrowRemoveCommand.js.map