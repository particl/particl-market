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
     *  [0]: profile_id or null if null then use the default profile
     *  [1]: item_id or hash
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        const favoriteParams = await this.getSearchParams(data);
        const favoriteItem = await this.favoriteItemService.search({profileId: favoriteParams[0], itemId: favoriteParams[1] } as FavoriteSearchParams);
        if (favoriteItem === null) {
            this.log.warn(`FavoriteItem with the item id=${favoriteParams[1]} was not found!`);
            throw new NotFoundException(favoriteParams[1]);
        }
        return this.favoriteItemService.destroy(favoriteItem.Id);
    }

    public help(): string {
        return this.getName() + ' <profileId> (<itemId> | <hash>)\n'
            + '    <profileId>                     - Numeric - The ID of the profile\n'
            + '                                       associated with the favorite we want to remove.\n'
            + '    <itemId>                        - Numeric - The ID of the listing item you want\n'
            + '                                       to remove from your favorites.\n'
            + '    <hash>                          - String - The hash of the listing item you want\n'
            + '                                       to remove from your favourites.\n';
    }

    public description(): string {
        return 'Command for removing an item from your favorites, identified by ID or hash.';
    }

    /**
     * TODO: NOTE: This function may be duplicated between commands.
     * data.params[]:
     *  [0]: item_id or hash
     *  [1]: profile_id or null
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     */
    private async getSearchParams(data: any): Promise<any> {
        let profileId = data.params[0];
        let itemId = data.params[1] || 0;

        // if item hash is in the params
        if (itemId && typeof itemId === 'string') {
            const listingItem = await this.listingItemService.findOneByHash(data.params[1]);
            itemId = listingItem.id;
        }
        // find listing item by id
        const item = await this.listingItemService.findOne(itemId);

        // if profile id not found in the params then find default profile
        if (!profileId || typeof profileId !== 'number') {
            const profile = await this.profileService.findOneByName('DEFAULT');
            profileId = profile.id;
        }
        if (item === null) {
            this.log.warn(`ListingItem with the id=${itemId} was not found!`);
            throw new NotFoundException(itemId);
        }
        return [profileId, item.id];
    }
}
