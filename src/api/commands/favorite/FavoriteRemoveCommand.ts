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

export class FavoriteRemoveCommand implements RpcCommandInterface<void> {

    public log: LoggerType;
    public name: string;
    public helpStr: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.FavoriteItemService) private favoriteItemService: FavoriteItemService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'removefavorite';
        this.helpStr = 'removefavorite (<itemId> | <hash>) [<profileId>]\n'
            + '    <itemId>                        - Numeric - The ID of the listing item you want\n'
            + '                                       to remove from your favorites.\n'
            + '    <hash>                          - String - The hash of the listing item you want\n'
            + '                                       to remove from your favourites.\n'
            + '    <profileId>                     - [optional] Numeric - The ID of the profile\n'
            + '                                       associated with the favorite we want to remove.\n';
    }

    /**
     *
     *  data.params[]:
     *  [0]: item_id or hash
     *  [1]: profile_id or null if null then use the default profile
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<void> {
        const favoriteParams = await this.getSearchParams(data);
        const favoriteItem = await this.favoriteItemService.search({ itemId: favoriteParams[0], profileId: favoriteParams[1] } as FavoriteSearchParams);
        if (favoriteItem === null) {
            this.log.warn(`FavoriteItem with the item id=${favoriteParams.itemId} was not found!`);
            throw new NotFoundException(favoriteParams.itemId);
        }
        return this.favoriteItemService.destroy(favoriteItem.Id);
    }

    public help(): string {
        return this.helpStr;
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
