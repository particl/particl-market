// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/model/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { BidActionService } from '../../services/action/BidActionService';
import { AddressService } from '../../services/model/AddressService';
import { ProfileService } from '../../services/model/ProfileService';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { MessageException } from '../../exceptions/MessageException';
import { BidDataValue } from '../../enums/BidDataValue';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { BidRequest } from '../../requests/action/BidRequest';
import { AddressCreateRequest } from '../../requests/model/AddressCreateRequest';
import { AddressType } from '../../enums/AddressType';

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
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.AddressService) private addressService: AddressService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.action.BidActionService) private bidActionService: BidActionService
    ) {
        super(Commands.BID_SEND);
        this.log = new Logger(__filename);
    }

    /**
     * Posts a Bid to the network
     * TODO: add daysRetention to the parameters
     * TODO: add estimateFee to the paramaters
     *
     * data.params[]:
     * [0]: listingItem, resources.ListingItem
     * [1]: profile, resources.Profile
     * [2]: address, resources.Address
     * [3]: bidDataId, string
     * [4]: bidDataValue, string
     * [5]: bidDataId, string
     * [6]: bidDataValue, string
     *      ...
     *
     * @param {RpcRequest} data
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const listingItem: resources.ListingItem = data.params.shift();
        const profile: resources.Profile = data.params.shift();
        const address: AddressCreateRequest = data.params.shift();

        // TODO: support for passing custom BidDatas seems to have been removed
        // TODO: the allowed custom BidDatas for a Bid should be defined in the ListingItem
        // ...BidDatas are KVS's planned to define the product variation being bought
        // const additionalParams: KVS[] = this.additionalDataToKVS(data);

        const fromAddress = profile.address;    // send from the given profiles address
        const toAddress = listingItem.seller;   // send to listingItem sellers address

        // TODO: currently hardcoded!!! parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10)
        const daysRetention = 2;
        const estimateFee = false;

        const postRequest = {
            sendParams: new SmsgSendParams(fromAddress, toAddress, false, daysRetention, estimateFee),
            listingItem,
            address
        } as BidRequest;

        const response: SmsgSendResponse = await this.bidActionService.post(postRequest);
        return response;

    }

    /**
     * data.params[]:
     * [0]: listingItemHash, string
     * [1]: profileId, number
     * [2]: addressId (from profile shipping addresses), number|false
     *                if false, the address must be passed as bidData id/value pairs
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

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('hash');
        } else if (data.params.length < 2) {
            throw new MissingParamException('profileId');
        } else if (data.params.length < 3) {
            throw new MissingParamException('address or addressId');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('hash');
        }

        if (typeof data.params[1] !== 'number') {
            throw new InvalidParamException('profileId');
        }

        if (typeof data.params[2] === 'boolean' && data.params[2] === false) {
            // make sure that required keys are there
            for (const addressKey of this.REQUIRED_ADDRESS_KEYS) {
                if (!_.includes(data.params, addressKey.toString()) ) {
                    throw new MissingParamException(addressKey);
                }
            }
        } else if (typeof data.params[2] !== 'number') {
            throw new InvalidParamException('addressId');
        }

        // make sure required data exists and fetch it
        const listingItemId = data.params.shift();
        const profileId = data.params.shift();
        const addressId = data.params.shift();

        // now the rest of data.params are either address values or biddatas

        const listingItem: resources.ListingItem = await this.listingItemService.findOneByHash(listingItemId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('ListingItem');
            });

        // profile that is doing the bidding
        const profile: resources.Profile = await this.profileService.findOne(profileId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        const address: AddressCreateRequest = this.getAddress(profile, addressId, data);

        // unshift the needed data back to the params array
        data.params.unshift(listingItem, profile, address);

        // make some other validations
        if (new Date().getTime() > listingItem.expiredAt) {
            this.log.warn(`ListingItem has expired!`);
            throw new MessageException('The ListingItem being bidded for has expired!');
        }

        // TODO: check that we are NOT the seller

        return data;
    }

    public usage(): string {
        return this.getName() + ' <itemhash> <profileId> <addressId | false> [(<bidDataKey>, <bidDataValue>), ...] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <listingItemHash>        - String - The hash of the item we want to send bids for. \n'
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

    /**
     * return the ShippingAddress
     *
     * @param profile
     * @param addressId
     * @param data
     */
    private getAddress(profile: resources.Profile, addressId: number | boolean, data: RpcRequest): AddressCreateRequest {

        if (typeof addressId === 'number') {
            const address = _.find(profile.ShippingAddresses, (addr: resources.Address) => {
                return addr.id === addressId;
            });

            // if address was found
            if (address) {
                delete address.id;  // we want to use an existing ShippingAddress, but save it separately for the Bid
                return {
                    profile_id: profile.id,
                    // title: address.title,
                    firstName: address.firstName,
                    lastName: address.lastName,
                    addressLine1: address.addressLine1,
                    addressLine2: address.addressLine2,
                    city: address.city,
                    state: address.state,
                    country: address.country,
                    zipCode: address.zipCode,
                    type: AddressType.SHIPPING_BID
                } as AddressCreateRequest;
            } else {
                throw new NotFoundException(addressId);
            }

        } else { // no addressId, address should have been given as key value params

            const address = {
                profile_id: profile.id,
                type: AddressType.SHIPPING_BID
            } as AddressCreateRequest;

            // loop through the data.params values and create the resources.Address
            while (!_.isEmpty(data.params)) {
                const paramKey = data.params.shift();
                const paramValue = data.params.shift();
                if (_.includes(this.PARAMS_ADDRESS_KEYS, paramKey)) {
                    // key is an address key
                    switch (paramKey) {
                        case BidDataValue.SHIPPING_ADDRESS_FIRST_NAME:
                            address.firstName = paramValue;
                            break;
                        case BidDataValue.SHIPPING_ADDRESS_LAST_NAME:
                            address.lastName = paramValue;
                            break;
                        case BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1:
                            address.addressLine1 = paramValue;
                            break;
                        case BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE2:
                            address.addressLine2 = paramValue;
                            break;
                        case BidDataValue.SHIPPING_ADDRESS_CITY:
                            address.city = paramValue;
                            break;
                        case BidDataValue.SHIPPING_ADDRESS_STATE:
                            address.state = paramValue;
                            break;
                        case BidDataValue.SHIPPING_ADDRESS_ZIP_CODE:
                            address.zipCode = paramValue;
                            break;
                        case BidDataValue.SHIPPING_ADDRESS_COUNTRY:
                            address.country = paramValue;
                            break;
                        default:
                            throw new InvalidParamException('addressKey');
                    }
                }
            }
            return address;

        }
    }

}
