import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { FavoriteItemService } from '../../services/FavoriteItemService';
import { ListingItemService } from '../../services/ListingItemService';
import { ProfileService } from '../../services/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { FavoriteItem } from '../../models/FavoriteItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { FavoriteSearchParams } from '../../requests/FavoriteSearchParams';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { FavoriteItemCreateRequest } from '../../requests/FavoriteItemCreateRequest';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

/**
 * Command for adding an item to your favorites, identified by ID or hash.
 */
export class FavoriteAddCommand extends BaseCommand implements RpcCommandInterface<FavoriteItem> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.FavoriteItemService) private favoriteItemService: FavoriteItemService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.FAVORITE_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * TODO: Update command to match help().
     *
     * data.params[]:
     *  [0]: item_id or hash
     *  [1]: profile_id or null
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<FavoriteItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<FavoriteItem> {
        const favoriteParams = await this.getSearchParams(data);
        // Check if favorite Item already exist
        let favoriteItem = await this.favoriteItemService.search({ itemId: favoriteParams[0], profileId: favoriteParams[1] } as FavoriteSearchParams);

        // favorite item not already exist then create
        if (favoriteItem === null) {
            favoriteItem = await this.favoriteItemService.create({
                listing_item_id: favoriteParams[0],
                profile_id: favoriteParams[1]
            } as FavoriteItemCreateRequest);
        }
        return favoriteItem;
    }

    public help(): string {
        return this.getName() + ' <profileId> (<itemId> | <hash>)\n'
            + '    <profileId>                     - Numeric - The ID of the profile we\n'
            + '                                       want to associate this favorite with.'
            + '    <itemId>                        - Numeric - The ID of the listing item you want to\n'
            + '                                       add to your favorites.\n'
            + '    <hash>                          - String - The hash of the listing item you want\n'
            + '                                       to add to your favorites.\n';
    }

    public description(): string {
        return 'Command for adding an item to your favorites, identified by ID or hash.';
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
        let itemId = data.params[0] || 0;
        let profileId = data.params[1];

        // if item hash is in the params
        if (itemId && typeof itemId === 'string') {
            const listingItem = await this.listingItemService.findOneByHash(data.params[0]);
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
        return [item.id, profileId];
    }
}
