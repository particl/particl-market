// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { FavoriteItemService } from '../../services/model/FavoriteItemService';
import { ListingItemService } from '../../services/model/ListingItemService';
import { ProfileService } from '../../services/model/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import {MissingParamException} from '../../exceptions/MissingParamException';
import {InvalidParamException} from '../../exceptions/InvalidParamException';
import * as resources from "resources";
import {ModelNotFoundException} from '../../exceptions/ModelNotFoundException';

/**
 * Command for removing an item from your favorites, identified by ID or hash.
 */
export class FavoriteRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.FavoriteItemService) private favoriteItemService: FavoriteItemService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.FAVORITE_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     *
     * data.params[]:
     *  [0]: profile: resources.Profile
     *  [1]: listingItem: resources.ListingItem
     *  [2]: favoriteItem: resources.FavoriteItem
     *
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        const favoriteItem: resources.FavoriteItem = data.params[2];
        return this.favoriteItemService.destroy(favoriteItem.id);
    }

    /**
     *
     *  data.params[]:
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
        }

        // make sure required data exists and fetch it
        let listingItem: resources.ListingItem;

        if (typeof data.params[1] === 'string') {
            listingItem = await this.listingItemService.findOneByHash(data.params[1])
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Profile');
                });
        } else {
            listingItem = await this.listingItemService.findOne(data.params[1])
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('ListingItem');
                });
        }

        const profile: resources.Profile = await this.profileService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        const favoriteItem: resources.FavoriteItem = await this.favoriteItemService.findOneByProfileIdAndListingItemId(profile.id, listingItem.id)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('FavoriteItem');
            });

        data.params[0] = profile;
        data.params[1] = listingItem;
        data.params[2] = favoriteItem;
        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> <listingItemId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>                   - Numeric - The ID of the profile \n'
            + '                                     associated with the favorite we want to remove. \n'
            + '    <listingItemId>               - Numeric - The ID of the listing item you want \n'
            + '                                     to remove from your favorites. \n';
    }

    public description(): string {
        return 'Command for removing a FavoriteItem.';
    }

    public example(): string {
        return 'favorite ' + this.getName() + ' 1 1';
    }
}
