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
        const favoriteParams = await this.favoriteItemService.getSearchParamsFromRpcRequest(data);
        const favoriteItem = await this.favoriteItemService.search({profileId: favoriteParams[0], itemId: favoriteParams[1] } as FavoriteSearchParams);
        if (favoriteItem === null) {
            this.log.warn(`FavoriteItem with the item id=${favoriteParams[1]} was not found!`);
            throw new NotFoundException(favoriteParams[1]);
        }
        return this.favoriteItemService.destroy(favoriteItem.Id);
    }

    public usage(): string {
        return this.getName() + ' <profileId> (<itemId>|<hash>) ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>                   - Numeric - The ID of the profile \n'
            + '                                     associated with the favorite we want to remove. \n'
            + '    <itemId>                      - Numeric - The ID of the listing item you want \n'
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
