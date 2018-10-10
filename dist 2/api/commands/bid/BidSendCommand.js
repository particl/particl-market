"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
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
const BidDataValue_1 = require("../../enums/BidDataValue");
let BidSendCommand = class BidSendCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemService, addressService, profileService, bidActionService) {
        super(CommandEnumType_1.Commands.BID_SEND);
        this.Logger = Logger;
        this.listingItemService = listingItemService;
        this.addressService = addressService;
        this.profileService = profileService;
        this.bidActionService = bidActionService;
        this.REQUIRED_ADDRESS_KEYS = [
            BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_FIRST_NAME.toString(),
            BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_LAST_NAME.toString(),
            BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1.toString(),
            BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_CITY.toString(),
            BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_STATE.toString(),
            BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_ZIP_CODE.toString(),
            BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_COUNTRY.toString()
        ];
        this.PARAMS_ADDRESS_KEYS = [
            BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_FIRST_NAME.toString(),
            BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_LAST_NAME.toString(),
            BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1.toString(),
            BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE2.toString(),
            BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_CITY.toString(),
            BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_STATE.toString(),
            BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_ZIP_CODE.toString(),
            BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_COUNTRY.toString()
        ];
        this.log = new Logger(__filename);
    }
    /**
     * Posts a Bid to the network
     *
     * data.params[]:
     * [0]: itemhash, string
     * [1]: profileId, number
     * [2]: addressId (from profile shipping addresses), number|false
     *                         if false, the address must be passed as bidData id/value pairs
     *                         in following format:
     *                         'ship.firstName',
     *                         'ship.lastName',
     *                         'ship.addressLine1',
     *                         'ship.addressLine2', (not required)
     *                         'ship.city',
     *                         'ship.state',
     *                         'ship.country'
     *                         'ship.zipCode',
     * [3]: bidDataId, string
     * [4]: bidDataValue, string
     * [5]: bidDataId, string
     * [6]: bidDataValue, string
     * ......
     *
     * @param {RpcRequest} data
     * @returns {Promise<SmsgSendResponse>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // todo: make sure listingitem exists in validate()
            // todo: make sure profile exists in validate()
            // listingitem we are bidding for
            const listingItemHash = data.params.shift();
            const listingItem = yield this.listingItemService.findOneByHash(listingItemHash)
                .then(value => {
                return value.toJSON();
            })
                .catch(reason => {
                throw new MessageException_1.MessageException('ListingItem not found.');
            });
            // profile that is doing the bidding
            const profileId = data.params.shift();
            const profile = yield this.profileService.findOne(profileId)
                .then(value => {
                return value.toJSON();
            })
                .catch(reason => {
                throw new MessageException_1.MessageException('Profile not found.');
            });
            const addressId = data.params.shift();
            const additionalParams = [];
            if (typeof addressId === 'number') {
                const address = _.find(profile.ShippingAddresses, (addr) => {
                    return addr.id === addressId;
                });
                // if address was found
                if (address) {
                    // store the shipping address in additionalParams
                    additionalParams.push({ id: BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_FIRST_NAME, value: address.firstName ? address.firstName : '' });
                    additionalParams.push({ id: BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_LAST_NAME, value: address.lastName ? address.lastName : '' });
                    additionalParams.push({ id: BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1, value: address.addressLine1 });
                    additionalParams.push({ id: BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE2, value: address.addressLine2 ? address.addressLine2 : '' });
                    additionalParams.push({ id: BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_CITY, value: address.city });
                    additionalParams.push({ id: BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_STATE, value: address.state });
                    additionalParams.push({ id: BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_ZIP_CODE, value: address.zipCode });
                    additionalParams.push({ id: BidDataValue_1.BidDataValue.SHIPPING_ADDRESS_COUNTRY, value: address.country });
                }
                else {
                    this.log.warn(`address with the id=${addressId} was not found!`);
                    throw new NotFoundException_1.NotFoundException(addressId);
                }
            }
            else {
                // add all first entries of PARAMS_ADDRESS_KEYS and their values if values not PARAMS_ADDRESS_KEYS themselves
                for (const paramsAddressKey of this.PARAMS_ADDRESS_KEYS) {
                    for (let j = 0; j < data.params.length - 1; ++j) {
                        if (paramsAddressKey === data.params[j]) {
                            additionalParams.push({ id: paramsAddressKey, value: !_.includes(this.PARAMS_ADDRESS_KEYS, data.params[j + 1]) ? data.params[j + 1] : '' });
                            break;
                        }
                    }
                }
            }
            return this.bidActionService.send(listingItem, profile, additionalParams);
        });
    }
    /**
     * data.params[]:
     * [0]: itemhash, string
     * [1]: profileId, number
     * [2]: addressId (from profile shipping addresses), number|false
     *                         if false, the address must be passed as bidData id/value pairs
     *                         in following format:
     *                         'ship.firstName',
     *                         'ship.lastName',
     *                         'ship.addressLine1',
     *                         'ship.addressLine2', (not required)
     *                         'ship.city',
     *                         'ship.state',
     *                         'ship.country'
     *                         'ship.zipCode',
     * [3]: bidDataId, string
     * [4]: bidDataValue, string
     * [5]: bidDataId, string
     * [6]: bidDataValue, string
     * ......
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // TODO: move the validation here, add separate error messages for missing parameters
            if (data.params.length < 3) {
                throw new MessageException_1.MessageException('Missing parameters.');
            }
            if (typeof data.params[0] !== 'string') {
                throw new MessageException_1.MessageException('Invalid hash.');
            }
            if (typeof data.params[1] !== 'number') {
                throw new MessageException_1.MessageException('Invalid profileId.');
            }
            if (typeof data.params[2] === 'boolean' && data.params[2] === false) {
                // make sure that required keys are there
                for (const addressKey of this.REQUIRED_ADDRESS_KEYS) {
                    if (!_.includes(data.params, addressKey.toString())) {
                        throw new MessageException_1.MessageException('Missing required param: ' + addressKey);
                    }
                }
            }
            else if (typeof data.params[2] !== 'number') {
                throw new MessageException_1.MessageException('Invalid addressId.');
            }
            return data;
        });
    }
    usage() {
        return this.getName() + ' <itemhash> <profileId> <addressId | false> [(<bidDataKey>, <bidDataValue>), ...] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to send bids for. \n'
            + '    <profileId>              - Numeric - The id of the profile we want to associate with the bid. \n'
            + '    <addressId>              - Numeric - The id of the address we want to associated with the bid. \n'
            + '    <bidDataKey>             - [optional] String - The key for additional data for the bid we want to send. \n'
            + '    <bidDataValue>           - [optional] String - The value for additional data for the bid we want to send. ';
    }
    description() {
        return 'Send bid.';
    }
    example() {
        return 'bid ' + this.getName() + ' 6e8c05ef939b1e30267a9912ecfe7560d758739c126f61926b956c087a1fedfe 1 1 ';
        // return 'bid ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb 1 ';
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