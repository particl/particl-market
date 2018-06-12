import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import {BidActionService, IdValuePair} from '../../services/BidActionService';
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
     *                      if false, the address must be passed as bidData id/value pairs
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

        this.validateParams(data.params);

        // listingitem we are bidding for
        const listingItemHash = data.params.shift();
        const listingItemModel = await this.listingItemService.findOneByHash(listingItemHash);
        const listingItem = listingItemModel.toJSON();

        // profile that is doing the bidding
        const profileId = data.params.shift();
        let profile: any = await this.profileService.findOne(profileId);
        profile = profile.toJSON();

        // find address by id
        const addressId = data.params.shift();
        const additionalParams: IdValuePair[] = this.bidActionService.getIdValuePairsFromArray(data.params);

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
        }

        return this.bidActionService.send(listingItem, profile, additionalParams);
    }

    public usage(): string {
        return this.getName() + ' <itemhash> <profileId> <AddressId> [(<bidDataId>, <bidDataValue>), ...] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to send bids for. \n'
            + '    <profileId>              - Numeric - The id of the profile we want to associate with the bid. \n'
            + '    <AddressId>              - Numeric - The id of the address we want to associated with the bid. \n'
            + '    <bidDataId>              - [optional] Numeric - The id of the bid we want to send. \n'
            + '    <bidDataValue>           - [optional] String - The value of the bid we want to send. ';
    }

    public description(): string {
        return 'Send bid.';
    }

    public example(): string {
        return '';
        // return 'bid ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb 1 [TODO] ';
    }

    private validateParams(params: any[]): boolean {

        if (params.length < 3) {
            throw new MessageException('Missing parameters.');
        }

        if (typeof params[0] !== 'string') {
            throw new MessageException('Invalid hash.');
        }

        if (typeof params[1] !== 'number') {
            throw new MessageException('Invalid profileId.');
        }

        if (typeof params[2] === 'boolean' && params[2] === false) {
            // make sure that required keys are there
            for (const addressKey of this.REQUIRED_ADDRESS_KEYS) {
                if (!_.includes(params, addressKey) ) {
                    throw new MessageException('Missing required param: ' + addressKey);
                }
            }
        } else if (typeof params[2] !== 'number') {
            throw new MessageException('Invalid addressId.');
        }

        return true;
    }

}
