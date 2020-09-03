// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { request, validate } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { ListingItemService } from '../../services/model/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { BidActionService } from '../../services/action/BidActionService';
import { AddressService } from '../../services/model/AddressService';
import { ProfileService } from '../../services/model/ProfileService';
import { MessageException } from '../../exceptions/MessageException';
import { BidDataValue } from '../../enums/BidDataValue';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { BidRequest } from '../../requests/action/BidRequest';
import { AddressCreateRequest } from '../../requests/model/AddressCreateRequest';
import { AddressType } from '../../enums/AddressType';
import { IdentityService } from '../../services/model/IdentityService';
import { MarketService } from '../../services/model/MarketService';
import { MessagingProtocol } from 'omp-lib/dist/interfaces/omp-enums';
import { SmsgService } from '../../services/SmsgService';

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
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.AddressService) private addressService: AddressService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
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
     * [1]: market, resources.Market
     * [2]: identity, resources.Identity
     * [3]: address, resources.Address
     * [...]: bidDataId, string, optional       TODO: currently ignored
     * [...]: bidDataValue, string, optional    TODO: currently ignored
     *
     * @param {RpcRequest} data
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const listingItem: resources.ListingItem = data.params.shift();
        const market: resources.Market = data.params.shift();
        const identity: resources.Identity = data.params.shift();
        const address: AddressCreateRequest = data.params.shift();

        // TODO: support for passing custom BidDatas seems to have been removed
        // TODO: the allowed custom BidDatas for a Bid should be defined in the ListingItem
        // ...BidDatas are KVS's planned to define the product variation being bought
        // const additionalParams: KVS[] = this.additionalDataToKVS(data);

        // before we can post the bid to the seller, we need to import the pubkey
        for (const msgInfo of listingItem.MessagingInformation) {
            if (msgInfo.protocol === MessagingProtocol.SMSG) {
                this.log.debug('execute(), identity.wallet: ', identity.wallet);
                this.log.debug('execute(), listingItem.seller: ', listingItem.seller);
                this.log.debug('execute(), msgInfo.publicKey: ', msgInfo.publicKey);
                await this.smsgService.smsgAddAddress(listingItem.seller, msgInfo.publicKey);
            }
        }

        const fromAddress = identity.address;   // send from the given identity
        const toAddress = listingItem.seller;   // send to listingItem sellers address

        const daysRetention: number = parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10);
        const estimateFee = false;

        const response: SmsgSendResponse = await this.bidActionService.post({
            sendParams: new SmsgSendParams(identity.wallet, fromAddress, toAddress, false, daysRetention, estimateFee),
            listingItem,
            market,
            address
        } as BidRequest);
        // this.log.debug('response: ', JSON.stringify(response, null, 2));

        return response;

    }

    /**
     * data.params[]:
     * [0]: listingItemId, number
     * [1]: identityId, number
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
     * [...]: bidDataId, string, optional
     * [...]: bidDataValue, string, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('identityId');
        } else if (data.params.length < 3) {
            throw new MissingParamException('address or addressId');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemId', 'number');
        } else if (typeof data.params[1] !== 'number') {
            throw new InvalidParamException('identityId', 'number');
        }

        if (typeof data.params[2] === 'boolean' && data.params[2] === false) {
            // make sure that required keys are there
            for (const addressKey of this.REQUIRED_ADDRESS_KEYS) {
                if (!_.includes(data.params, addressKey.toString()) ) {
                    throw new MissingParamException(addressKey);
                }
            }
        } else if (typeof data.params[2] !== 'number') {
            throw new InvalidParamException('addressId', 'number');
        }

        // make sure required data exists and fetch it
        const listingItemId = data.params.shift();
        const identityId = data.params.shift();
        const addressId = data.params.shift();

        // now the rest of data.params are either address values or biddatas

        const listingItem: resources.ListingItem = await this.listingItemService.findOne(listingItemId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('ListingItem');
            });

        const identity: resources.Identity = await this.identityService.findOne(identityId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Identity');
            });

        const profile: resources.Profile = await this.profileService.findOne(identity.Profile.id)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        // the seller could be selling the ListingItem that were bidding for in multiple markets (having the same hash),
        // so we need to also send the market info to the seller
        const market: resources.Market = await this.marketService.findOneByProfileIdAndReceiveAddress(profile.id, listingItem.market)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Market');
            });

        const address: AddressCreateRequest = this.getAddress(profile, addressId, data);

        // unshift the needed data back to the params array
        data.params.unshift(listingItem, market, identity, address);

        // make some other validations
        if (Date.now() > listingItem.expiredAt) {
            this.log.warn(`ListingItem has expired!`);
            throw new MessageException('The ListingItem being bidded for has expired!');
        }

        if (listingItem.seller === identity.address) {
            throw new MessageException('You cannot Bid for your own ListingItem');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemId> <identityId> <addressId|false> [(<bidDataKey>, <bidDataValue>), ...] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <listingItemId>          - Numeric - The id of the ListingItem we want to send Bids for. \n'
            + '    <identityId>             - Numeric - The id of the Identity we want to associate with the Bid. \n'
            + '    <addressId>              - Numeric - The id of the Address we want to associated with the Bid. \n'
            + '    <bidDataKey>             - [optional] String - The key for additional data for the Bid we want to send. \n'
            + '    <bidDataValue>           - [optional] String - The value for additional data for the Bid we want to send. ';
    }

    public description(): string {
        return 'Send Bid.';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' 1 1 1 ';
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
                throw new ModelNotFoundException('Address');
            }

        } else { // no addressId, address should have been given as key value params

            const address = {
                profile_id: profile.id,
                type: AddressType.SHIPPING_BID
            } as AddressCreateRequest;

            // loop through the data.params values and create the resources.Address
            while (!_.isEmpty(data.params)) {
                if (data.params.length < 2) {
                    throw new MissingParamException('paramValue');
                }
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
                            throw new InvalidParamException('addressKey', 'BidDataValue');
                    }
                }
            }
            return address;

        }
    }

}
