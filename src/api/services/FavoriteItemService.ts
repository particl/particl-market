import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MessageException } from '../exceptions/MessageException';
import { FavoriteItemRepository } from '../repositories/FavoriteItemRepository';
import { FavoriteItem } from '../models/FavoriteItem';
import { FavoriteItemCreateRequest } from '../requests/FavoriteItemCreateRequest';
import { FavoriteItemUpdateRequest } from '../requests/FavoriteItemUpdateRequest';
import { FavoriteSearchParams } from '../requests/FavoriteSearchParams';
import { ListingItemService } from './ListingItemService';
import { ProfileService } from './ProfileService';

export class FavoriteItemService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.FavoriteItemRepository) public favoriteItemRepo: FavoriteItemRepository,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<FavoriteItem>> {
        return this.favoriteItemRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<FavoriteItem> {
        const favoriteItem = await this.favoriteItemRepo.findOne(id, withRelated);
        if (favoriteItem === null) {
            this.log.warn(`FavoriteItem with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return favoriteItem;
    }

    /**
     * search favorite item using given FavoriteSearchParams
     *
     * @param options
     * @returns {Promise<FavoriteItem> }
     */

    @validate()
    public async search(
        @request(FavoriteSearchParams) options: FavoriteSearchParams): Promise<FavoriteItem> {
        const searchParams = await this.checkSearchByItemHashOrProfileName(options);
        return this.favoriteItemRepo.search(searchParams);
    }


    @validate()
    public async create( @request(FavoriteItemCreateRequest) body: FavoriteItemCreateRequest): Promise<FavoriteItem> {

        // If the request body was valid we will create the favoriteItem
        const favoriteItem = await this.favoriteItemRepo.create(body);

        // finally find and return the created favoriteItem
        const newFavoriteItem = await this.findOne(favoriteItem.Id);
        return newFavoriteItem;
    }


    @validate()
    public async update(id: number, @request(FavoriteItemUpdateRequest) body: FavoriteItemUpdateRequest): Promise<FavoriteItem> {

        // find the existing one without related
        const favoriteItem = await this.findOne(id, false);

        // set new values
        // update favoriteItem record
        const updatedFavoriteItem = await this.favoriteItemRepo.update(id, body);
        return updatedFavoriteItem;
    }

    public async destroy(id: number): Promise<void> {
        await this.favoriteItemRepo.destroy(id);
    }

    /**
     * search favorite item using given FavoriteSearchParams
     * when itemId is string then find by item hash
     * when profileId is string then find by profile name
     *
     * @param options
     * @returns {Promise<FavoriteSearchParams> }
     */

    private async checkSearchByItemHashOrProfileName(options: FavoriteSearchParams): Promise<FavoriteSearchParams> {

        // if options.itemId is string then find by hash
        if (typeof options.itemId === 'string') {
            const listingItem = await this.listingItemService.findOneByHash(options.itemId);
            options.itemId = listingItem.id;
        }
        // if options.profileId is string then find by profile name
        if (typeof options.profileId === 'string') {
            const profile = await this.profileService.findOneByName(options.profileId);
            if (profile === null) {
                throw new MessageException(`Profile not found for the given name = ${options.profileId}`);
            }
            options.profileId = profile.id;
        }

        return options;
    }
}
