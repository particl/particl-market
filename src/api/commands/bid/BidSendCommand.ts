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
import { BidActionService } from '../../services/BidActionService';
import { AddressService } from '../../services/AddressService';
import { ProfileService } from '../../services/ProfileService';
import { NotFoundException } from '../../exceptions/NotFoundException';
import * as resources from 'resources';
import { MessageException } from '../../exceptions/MessageException';

export class BidSendCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

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

    public bidDataIds: string[] = [
        'SHIPPING_ADDRESS_FIRST_NAME',
        'SHIPPING_ADDRESS_LAST_NAME',
        'SHIPPING_ADDRESS_ADDRESS_LINE1',
        'SHIPPING_ADDRESS_ADDRESS_LINE2',
        'SHIPPING_ADDRESS_CITY',
        'SHIPPING_ADDRESS_STATE',
        'SHIPPING_ADDRESS_COUNTRY',
        'SHIPPING_ADDRESS_ZIP_CODE'
    ];

    /**
     * Posts a Bid to the network
     * If addressId is null then one of bidDataId must be equal to addressId 
     * and its bidDataId = bidDataValue should have following format:
     * SHIPPING_ADDRESS_FIRST_NAME = 'ship.firstName',
     * SHIPPING_ADDRESS_LAST_NAME = 'ship.lastName',
     * SHIPPING_ADDRESS_ADDRESS_LINE1 = 'ship.addressLine1',
     * SHIPPING_ADDRESS_ADDRESS_LINE2 = 'ship.addressLine2',
     * SHIPPING_ADDRESS_CITY = 'ship.city',
     * SHIPPING_ADDRESS_STATE = 'ship.state',
     * SHIPPING_ADDRESS_COUNTRY = 'ship.country'
     * SHIPPING_ADDRESS_ZIP_CODE = 'ship.zipCode',
     *
     * data.params[]:
     * [0]: itemhash, string
     * [1]: profileId, number
     * [2]: addressId (from profile shipping addresses), number | null
     * [3]: bidDataId, string 
     * [4]: bidDataValue, string
     * [5]: bidDataId, string
     * [6]: bidDataValue, string
     * ......
     *
     * @param data
     * @returns {Promise<Bookshelf<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        if (data.params.length < 3) {
            throw new MessageException('Missing parameters.');
        }

        if (typeof data.params[0] !== 'string') {
            throw new MessageException('Invalid hash.');
        }

        if (typeof data.params[1] !== 'number' && typeof data.params[2] !== 'number') {
            throw new MessageException('Invalid profileId or addressId.');
        }

        // listingitem we are bidding for
        const listingItemHash = data.params.shift();
        const listingItemModel = await this.listingItemService.findOneByHash(listingItemHash);
        const listingItem = listingItemModel.toJSON();

        // profile that is doing the bidding
        const profileId = data.params.shift();
        let profile: any;
        try {
            profile = await this.profileService.findOne(profileId);
            profile = profile.toJSON();
        } catch ( ex ) {
            this.log.error(ex);
            throw new MessageException('No correct profile id.');    
        }

        // find address by id if not null
        const addressId = data.params.shift();
        let address: any;
        if (!addressId) {
            let curField = 0;
            let bidDataId: string;
            let bidDataValue: string;
            const bidDataValues: string[] = [];
            while (bidDataId = data.params.shift()) {
                bidDataValue = data.params.shift();
                if (bidDataId != this.bidDataIds[curField]) {
                    continue;
                } else {
                    bidDataValues.push(bidDataValue);
                    ++curField;
                }
            }
            if (bidDataValues.length < this.bidDataIds.length) {
                throw new MessageException('Incorrect address data in bidData.');
            }
            address = this.addressService.create(new AddressCreateRequest({
                profile_id: profile.id,
                firstName: bidDataValues[0],
                lastName: bidDataValues[1],
                addressLine1: bidDataValues[2],
                addressLine2: bidDataValues[3],
                city: bidDataValues[4],
                state: bidDataValues[5],
                country: bidDataValues[6],
                zipCode: bidDataValues[7],
                type: AddressType.SHIPPING_OWN
            }));    
        } else {
            address = _.find(profile.ShippingAddresses, (addr: any) => {
                return addr.id === addressId;
            });
            // if address not found
            if (address === null) {
                this.log.warn(`address with the id=${addressId} was not found!`);
                throw new NotFoundException(addressId);
            }
        }

        return this.bidActionService.send(listingItem, profile, address, data.params);
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

}
