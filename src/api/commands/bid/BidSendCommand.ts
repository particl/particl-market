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
import { BidActionService } from '../../services/BidActionService';
import { AddressService } from '../../services/AddressService';
import { ProfileService } from '../../services/ProfileService';
import { NotFoundException } from '../../exceptions/NotFoundException';
import * as resources from 'resources';
import {MessageException} from '../../exceptions/MessageException';

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

        // get listing item hash it is in first argument in the data.params
        const listingItemHash = data.params.shift();

        // find listingItem by hash
        const listingItemModel = await this.listingItemService.findOneByHash(listingItemHash);
        const listingItem = listingItemModel.toJSON();

        // find profile by id
        const profileId = data.params.shift();
        let profile: any = await this.profileService.findOne(profileId);
        profile = profile.toJSON();
        // this.log.warn('profile = ' + JSON.stringify(profile));

        // if profile not found
        if (profile === null) {
            this.log.warn(`Profile with the id=${profileId} was not found!`);
            throw new NotFoundException(profileId);
        }

        // find address by id
        const addressId = data.params.shift();
        const address: any = _.find(profile.ShippingAddresses, (addr: any) => {
            return addr.id === addressId;
        });

        // if address not found
        if (address === null) {
            this.log.warn(`address with the id=${addressId} was not found!`);
            throw new NotFoundException(addressId);
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
