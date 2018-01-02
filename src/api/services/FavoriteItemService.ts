import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { FavoriteItemRepository } from '../repositories/FavoriteItemRepository';
import { FavoriteItem } from '../models/FavoriteItem';
import { FavoriteItemCreateRequest } from '../requests/FavoriteItemCreateRequest';
import { FavoriteItemUpdateRequest } from '../requests/FavoriteItemUpdateRequest';
import { FavoriteSearchParams } from '../requests/FavoriteSearchParams';

export class FavoriteItemService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.FavoriteItemRepository) public favoriteItemRepo: FavoriteItemRepository,
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
        return this.favoriteItemRepo.search(options);
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
}
