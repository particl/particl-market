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
    public async create( @request(FavoriteItemCreateRequest) body: any): Promise<FavoriteItem> {

        // TODO: extract and remove related models from request
        // const favoriteItemRelated = body.related;
        // delete body.related;
        // If the request body was valid we will create the favoriteItem
        const favoriteItem = await this.favoriteItemRepo.create(body);
        // TODO: create related models
        // favoriteItemRelated._id = favoriteItem.Id;
        // await this.favoriteItemRelatedService.create(favoriteItemRelated);

        // finally find and return the created favoriteItem
        const newFavoriteItem = await this.findOne(favoriteItem.id);
        return newFavoriteItem;
    }


    @validate()
    public async update(id: number, @request(FavoriteItemUpdateRequest) body: any): Promise<FavoriteItem> {

        // find the existing one without related
        const favoriteItem = await this.findOne(id, false);

        // set new values

        // update favoriteItem record
        const updatedFavoriteItem = await this.favoriteItemRepo.update(id, body);

        // TODO: yes, this is stupid
        // TODO: find related record and delete it
        // let favoriteItemRelated = updatedFavoriteItem.related('FavoriteItemRelated').toJSON();
        // await this.favoriteItemService.destroy(favoriteItemRelated.id);

        // TODO: recreate related data
        // favoriteItemRelated = body.favoriteItemRelated;
        // favoriteItemRelated._id = favoriteItem.Id;
        // const createdFavoriteItem = await this.favoriteItemService.create(favoriteItemRelated);

        // TODO: finally find and return the updated favoriteItem
        // const newFavoriteItem = await this.findOne(id);
        // return newFavoriteItem;

        return updatedFavoriteItem;
    }

    /**
     * options:
     *  options.item_id
     *  options.profile_id
     *
     * remove favorite by item id and profile id
     */

    @validate()
    public async destroy(@request(FavoriteSearchParams) options: FavoriteSearchParams): Promise<void> {
        const favoriteItem = await this.favoriteItemRepo.search(options);
        if (favoriteItem === null) {
            this.log.warn(`FavoriteItem with the id=${options.itemId} was not found!`);
            throw new NotFoundException(options.itemId);
        }
        await this.favoriteItemRepo.destroy(favoriteItem.id);
    }
}
