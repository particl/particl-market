// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { FavoriteItemService } from '../../services/FavoriteItemService';
import { ListingItemService } from '../../services/ListingItemService';
import { ProfileService } from '../../services/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { FavoriteSearchParams } from '../../requests/FavoriteSearchParams';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import {MessageException} from '../../exceptions/MessageException';

/**
 * Command for removing an item from your favorites, identified by ID or hash.
 */
export class FavoriteRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.FavoriteItemService) private favoriteItemService: FavoriteItemService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.FAVORITE_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     *
     *  data.params[]:
     *  [0]: profile_id
     *  [1]: item_id or hash
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        const favoriteItemModel = await this.favoriteItemService.findOneByProfileIdAndListingItemId(data.params[0], data.params[1]);
        const favoriteItem = favoriteItemModel.toJSON();
        return this.favoriteItemService.destroy(favoriteItem.id);
    }

    /**
     * validate that profile and item exists, replace possible hash with id
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 2) {
            throw new MessageException('Missing parameters.');
        }

        const profileId = data.params[0];
        let itemId = data.params[1];

        if (profileId && typeof profileId === 'string') {
            throw new MessageException('profileId cant be a string.');
        } else {
            // make sure profile with the id exists
            await this.profileService.findOne(profileId);   // throws if not found
        }

        // if item hash is in the params, fetch the id
        if (itemId && typeof itemId === 'string') {

            const listingItemModel = await this.listingItemService.findOneByHash(itemId);
            const listingItem = listingItemModel.toJSON();
            itemId = listingItem.id;
        } else {
            // else make sure the the item with the id exists, throws if not
            const item = await this.listingItemService.findOne(itemId);
        }
        return await this.favoriteItemService.findOneByProfileIdAndListingItemId(profileId, itemId) // throws if not found
            .catch(reason => {
                // great, not found, so we can continue and create it
                // return RpcRequest with the correct data to be passed to execute
            })
            .then(value => {
                if (value) {
                    data.params[0] = profileId;
                    data.params[1] = itemId;
                    return data;
                } else {
                    throw new MessageException('FavoriteItem doesnt exist.');
                }
            });
    }

    public usage(): string {
        return this.getName() + ' <profileId> (<itemId>|<hash>) ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>                   - Numeric - The ID of the profile \n'
            + '                                     associated with the favorite we want to remove. \n'
            + '    <listingItemId>               - Numeric - The ID of the listing item you want \n'
            + '                                     to remove from your favorites. \n'
            + '    <hash>                        - String - The hash of the listing item you want \n'
            + '                                     to remove from your favourites. ';
    }

    public description(): string {
        return 'Command for removing an item from your favorites, identified by ID or hash.';
    }

    public example(): string {
        return 'favorite ' + this.getName() + ' 1 1 b90cee25-036b-4dca-8b17-0187ff325dbb ';
    }
}
