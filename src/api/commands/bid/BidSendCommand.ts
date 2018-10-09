// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { AddressCreateRequest } from '../../requests/AddressCreateRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { AddressType } from '../../enums/AddressType';
import { BidActionService, IdValuePair } from '../../services/BidActionService';
import { AddressService } from '../../services/AddressService';
import { ProfileService } from '../../services/ProfileService';
import { NotFoundException } from '../../exceptions/NotFoundException';
import * as resources from 'resources';
import { MessageException } from '../../exceptions/MessageException';
import { BidDataValue } from '../../enums/BidDataValue';

export class BidSendCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    private REQUIRED_ADDRESS_KEYS: string[] = [
        BidDataValue.SHIPPING_ADDRESS_FIRST_NAME.toString(),
        BidDataValue.SHIPPING_ADDRESS_LAST_NAME.toString(),
        BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1.toString(),
        BidDataValue.SHIPPING_ADDRESS_CITY.toString(),
        BidDataValue.SHIPPING_ADDRESS_STATE.toString(),
        BidDataValue.SHIPPING_ADDRESS_ZIP_CODE.toString(),
        BidDataValue.SHIPPING_ADDRESS_COUNTRY.toString()
    ];

    private PARAMS_ADDRESS_KEYS: string[] = [
        BidDataValue.SHIPPING_ADDRESS_FIRST_NAME.toString(),
        BidDataValue.SHIPPING_ADDRESS_LAST_NAME.toString(),
        BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1.toString(),
        BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE2.toString(),
        BidDataValue.SHIPPING_ADDRESS_CITY.toString(),
        BidDataValue.SHIPPING_ADDRESS_STATE.toString(),
        BidDataValue.SHIPPING_ADDRESS_ZIP_CODE.toString(),
        BidDataValue.SHIPPING_ADDRESS_COUNTRY.toString()
    ];

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.AddressService) private addressService: AddressService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.BidActionService) private bidActionService: BidActionService
    ) {
        super(Commands.BID_SEND);
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
     *                         'shippingAddress.firstName',
     *                         'shippingAddress.lastName',
     *                         'shippingAddress.addressLine1',
     *                         'shippingAddress.addressLine2', (not required)
     *                         'shippingAddress.city',
     *                         'shippingAddress.state',
     *                         'shippingAddress.country'
     *                         'shippingAddress.zipCode',
     * [3]: bidDataId, string
     * [4]: bidDataValue, string
     * [5]: bidDataId, string
     * [6]: bidDataValue, string
     * ......
     *
     * @param {RpcRequest} data
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        // todo: make sure listingitem exists in validate()
        // todo: make sure profile exists in validate()

        // listingitem we are bidding for
        const listingItemHash = data.params.shift();
        const listingItem: resources.ListingItem = await this.listingItemService.findOneByHash(listingItemHash)
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new MessageException('ListingItem not found.');
            });

        // profile that is doing the bidding
        const profileId = data.params.shift();
        const profile: resources.Profile = await this.profileService.findOne(profileId)
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new MessageException('Profile not found.');
            });

        const addressId = data.params.shift();
        const additionalParams: IdValuePair[] = [];

        if (typeof addressId === 'number') {
            const address = _.find(profile.ShippingAddresses, (addr: any) => {
                return addr.id === addressId;
            });
            // if address was found
            if (address) {
                // store the shipping address in additionalParams
                additionalParams.push({id: BidDataValue.SHIPPING_ADDRESS_FIRST_NAME, value: address.firstName ? address.firstName : ''});
                additionalParams.push({id: BidDataValue.SHIPPING_ADDRESS_LAST_NAME, value: address.lastName ? address.lastName : ''});
                additionalParams.push({id: BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1, value: address.addressLine1});
                additionalParams.push({id: BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE2, value: address.addressLine2 ? address.addressLine2 : ''});
                additionalParams.push({id: BidDataValue.SHIPPING_ADDRESS_CITY, value: address.city});
                additionalParams.push({id: BidDataValue.SHIPPING_ADDRESS_STATE, value: address.state});
                additionalParams.push({id: BidDataValue.SHIPPING_ADDRESS_ZIP_CODE, value: address.zipCode});
                additionalParams.push({id: BidDataValue.SHIPPING_ADDRESS_COUNTRY, value: address.country});
            } else {
                this.log.warn(`address with the id=${addressId} was not found!`);
                throw new NotFoundException(addressId);
            }
        } else {
            // add all first entries of PARAMS_ADDRESS_KEYS and their values if values not PARAMS_ADDRESS_KEYS themselves
            for (const paramsAddressKey of this.PARAMS_ADDRESS_KEYS) {
                for (let j = 0; j < data.params.length - 1; ++j) {
                    if (paramsAddressKey === data.params[j]) {
                        additionalParams.push({id:  paramsAddressKey, value:
                        !_.includes(this.PARAMS_ADDRESS_KEYS, data.params[j + 1]) ? data.params[j + 1] : ''});
                        break;
                    }
                }
            }
        }

        return this.bidActionService.send(listingItem, profile, additionalParams);
    }

    /**
     * data.params[]:
     * [0]: itemhash, string
     * [1]: profileId, number
     * [2]: addressId (from profile shipping addresses), number|false
     *                         if false, the address must be passed as bidData id/value pairs
     *                         in following format:
     *                         'shippingAddress.firstName',
     *                         'shippingAddress.lastName',
     *                         'shippingAddress.addressLine1',
     *                         'shippingAddress.addressLine2', (not required)
     *                         'shippingAddress.city',
     *                         'shippingAddress.state',
     *                         'shippingAddress.country'
     *                         'shippingAddress.zipCode',
     * [3]: bidDataId, string
     * [4]: bidDataValue, string
     * [5]: bidDataId, string
     * [6]: bidDataValue, string
     * ......
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // TODO: move the validation here, add separate error messages for missing parameters

        if (data.params.length < 3) {
            throw new MessageException('Missing parameters.');
        }

        if (typeof data.params[0] !== 'string') {
            throw new MessageException('Invalid hash.');
        }

        if (typeof data.params[1] !== 'number') {
            throw new MessageException('Invalid profileId.');
        }

        if (typeof data.params[2] === 'boolean' && data.params[2] === false) {
            // make sure that required keys are there
            for (const addressKey of this.REQUIRED_ADDRESS_KEYS) {
                if (!_.includes(data.params, addressKey.toString()) ) {
                    throw new MessageException('Missing required param: ' + addressKey);
                }
            }
        } else if (typeof data.params[2] !== 'number') {
            throw new MessageException('Invalid addressId.');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <itemhash> <profileId> <addressId | false> [(<bidDataKey>, <bidDataValue>), ...] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to send bids for. \n'
            + '    <profileId>              - Numeric - The id of the profile we want to associate with the bid. \n'
            + '    <addressId>              - Numeric - The id of the address we want to associated with the bid. \n'
            + '    <bidDataKey>             - [optional] String - The key for additional data for the bid we want to send. \n'
            + '    <bidDataValue>           - [optional] String - The value for additional data for the bid we want to send. ';
    }

    public description(): string {
        return 'Send bid.';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' 6e8c05ef939b1e30267a9912ecfe7560d758739c126f61926b956c087a1fedfe 1 1 ';
        // return 'bid ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb 1 ';
    }

}
