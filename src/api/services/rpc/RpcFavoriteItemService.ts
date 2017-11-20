import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { FavoriteItemService } from '../FavoriteItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { FavoriteItem } from '../../models/FavoriteItem';
import { ListingItemService } from '../ListingItemService';
import { ProfileService } from '../ProfileService';
import { FavoriteItemRepository } from '../../repositories/FavoriteItemRepository';
import { NotFoundException } from '../../exceptions/NotFoundException';

export class RpcFavoriteItemService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.FavoriteItemService) private favoriteItemService: FavoriteItemService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService,
        @inject(Types.Repository) @named(Targets.Repository.FavoriteItemRepository) public favoriteItemRepository: FavoriteItemRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    /**
     * params: none
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<FavoriteItem>>}
     */
    @validate()
    public async findAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<FavoriteItem>> {
        return this.favoriteItemService.findAll();
    }

    /**
     * data.params[]:
     *  [0]: id
     *
     * @param data
     * @returns {Promise<FavoriteItem>}
     */
    @validate()
    public async findOne( @request(RpcRequest) data: any): Promise<FavoriteItem> {
        return await this.favoriteItemService.findOne(data.params[0]);

    }

    /**
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
    public async addFavorite( @request(RpcRequest) data: any): Promise<FavoriteItem> {
        const favoriteParams = await this.checkParams(data);
        // Check if favorite Item already exist
        let favoriteItem = await this.favoriteItemRepository.findByItemAndProfile(favoriteParams);
        // favorite item not already exist then create
        if (favoriteItem === null) {
            favoriteItem = await this.favoriteItemService.create({
                listing_item_id: favoriteParams[0],
                profile_id: favoriteParams[1]
            });
        }
        return favoriteItem;
    }

    /**
     * data.params[]:
     *  [0]: item_id or hash
     *  [1]: profile_id or null
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     */

    public async checkParams(data: any): Promise<any> {
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

    /**
     * data.params[]:
     *  [0]: item_id or hash
     *  [1]: profile_id or null
     *
     */
    @validate()
    public async removeFavorite( @request(RpcRequest) data: any): Promise<void> {
        const favoriteParams = await this.checkParams(data);
        return this.favoriteItemService.removeFavorite(favoriteParams);
    }

}
