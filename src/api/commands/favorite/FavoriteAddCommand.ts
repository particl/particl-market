// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { FavoriteItemService } from '../../services/model/FavoriteItemService';
import { ListingItemService } from '../../services/model/ListingItemService';
import { ProfileService } from '../../services/model/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { FavoriteItem } from '../../models/FavoriteItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { FavoriteItemCreateRequest } from '../../requests/model/FavoriteItemCreateRequest';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

/**
 * Command for adding an item to your favorites, identified by ID or hash.
 */
export class FavoriteAddCommand extends BaseCommand implements RpcCommandInterface<FavoriteItem> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.FavoriteItemService) private favoriteItemService: FavoriteItemService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.FAVORITE_ADD);
        this.log = new Logger(__filename);
    }

    /**
     *
     * data.params[]:
     *  [0]: profile: resources.Profile
     *  [1]: listingItem: resources.ListingItem
     *
     * when data.params[1] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<FavoriteItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<FavoriteItem> {
        const profile: resources.Profile = data.params[0];
        const listingItem: resources.ListingItem = data.params[1];

        return await this.favoriteItemService.create({
            profile_id: profile.id,
            listing_item_id: listingItem.id
        } as FavoriteItemCreateRequest);
    }

    /**
     * validate that profile and item exists, replace possible hash with id
     *
     * data.params[]:
     *  [0]: profileId
     *  [1]: listingItemId
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('listingItemId');
        }

        if (data.params[0] && typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        } else if (data.params[1] && typeof data.params[1] !== 'number') {
            throw new InvalidParamException('listingItemId', 'number');
        }

        // make sure required data exists and fetch it
        const profile: resources.Profile = await this.profileService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        const listingItem: resources.ListingItem = await this.listingItemService.findOne(data.params[1])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('ListingItem');
            });

        await this.favoriteItemService.findOneByProfileIdAndListingItemId(profile.id, listingItem.id)
            .then(value => {
                throw new MessageException('FavoriteItem already exists.');
            })
            .catch(reason => {
                // great, not found, so we can continue and create it
                // return RpcRequest with the correct data to be passed to execute
            });

        data.params[0] = profile;
        data.params[1] = listingItem;
        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> <listingItemId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>                   - Numeric - The ID of the profile we \n'
            + '                                     want to associate this favorite with. \n'
            + '    <listingItemId>               - Numeric - The ID of the listing item you want to \n'
            + '                                     add to your favorites. \n';
    }

    public description(): string {
        return 'Command for adding FavoriteItems.';
    }

    public example(): string {
        return 'favorite ' + this.getName() + ' 1 1 ';
    }
}
