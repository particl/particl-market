"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ListingItemService_1 = require("../../services/ListingItemService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const BidActionService_1 = require("../../services/BidActionService");
const AddressService_1 = require("../../services/AddressService");
const ProfileService_1 = require("../../services/ProfileService");
const NotFoundException_1 = require("../../exceptions/NotFoundException");
const MessageException_1 = require("../../exceptions/MessageException");
let BidSendCommand = class BidSendCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemService, addressService, profileService, bidActionService) {
        super(CommandEnumType_1.Commands.BID_SEND);
        this.Logger = Logger;
        this.listingItemService = listingItemService;
        this.addressService = addressService;
        this.profileService = profileService;
        this.bidActionService = bidActionService;
        this.log = new Logger(__filename);
    }
    /**
     * Posts a Bid to the network
     *
     * data.params[]:
     * [0]: itemhash, string
     * [1]: profileId, number
     * [1]: addressId (from profile shipping addresses), number
     * [2]: bidDataId, string
     * [3]: bidDataValue, string
     * [4]: bidDataId, string
     * [5]: bidDataValue, string
     * ......
     *
     * @param data
     * @returns {Promise<Bookshelf<void>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 3) {
                throw new MessageException_1.MessageException('Missing parameters.');
            }
            if (typeof data.params[0] !== 'string') {
                throw new MessageException_1.MessageException('Invalid hash.');
            }
            if (typeof data.params[1] !== 'number' && typeof data.params[2] !== 'number') {
                throw new MessageException_1.MessageException('Invalid profileId or addressId.');
            }
            // get listing item hash it is in first argument in the data.params
            const listingItemHash = data.params.shift();
            // find listingItem by hash
            const listingItemModel = yield this.listingItemService.findOneByHash(listingItemHash);
            const listingItem = listingItemModel.toJSON();
            // find profile by id
            const profileId = data.params.shift();
            let profile = yield this.profileService.findOne(profileId);
            profile = profile.toJSON();
            // this.log.warn('profile = ' + JSON.stringify(profile));
            // if profile not found
            if (profile === null) {
                this.log.warn(`Profile with the id=${profileId} was not found!`);
                throw new NotFoundException_1.NotFoundException(profileId);
            }
            // find address by id
            const addressId = data.params.shift();
            const address = _.find(profile.ShippingAddresses, (addr) => {
                return addr.id === addressId;
            });
            // if address not found
            if (address === null) {
                this.log.warn(`address with the id=${addressId} was not found!`);
                throw new NotFoundException_1.NotFoundException(addressId);
            }
            return this.bidActionService.send(listingItem, profile, address, data.params);
        });
    }
    usage() {
        return this.getName() + ' <itemhash> <profileId> <AddressId> [(<bidDataId>, <bidDataValue>), ...] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to send bids for. \n'
            + '    <profileId>              - Numeric - The id of the profile we want to associate with the bid. \n'
            + '    <AddressId>              - Numeric - The id of the address we want to associated with the bid. \n'
            + '    <bidDataId>              - [optional] Numeric - The id of the bid we want to send. \n'
            + '    <bidDataValue>           - [optional] String - The value of the bid we want to send. ';
    }
    description() {
        return 'Send bid.';
    }
    example() {
        return '';
        // return 'bid ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb 1 [TODO] ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], BidSendCommand.prototype, "execute", null);
BidSendCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.AddressService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.BidActionService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemService_1.ListingItemService,
        AddressService_1.AddressService,
        ProfileService_1.ProfileService,
        BidActionService_1.BidActionService])
], BidSendCommand);
exports.BidSendCommand = BidSendCommand;
//# sourceMappingURL=BidSendCommand.js.map