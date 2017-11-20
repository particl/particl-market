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
import { RpcRequest } from '../requests/RpcRequest';


export class FavoriteItemService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.FavoriteItemRepository) public favoriteItemRepo: FavoriteItemRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<FavoriteItem>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<FavoriteItem>> {
        return this.favoriteItemRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<FavoriteItem> {
        return this.findOne(data.params[0]);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<FavoriteItem> {
        const favoriteItem = await this.favoriteItemRepo.findOne(id, withRelated);
        if (favoriteItem === null) {
            this.log.warn(`FavoriteItem with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return favoriteItem;
    }

    public async findByItemAndProfile(data: any): Promise<FavoriteItem> {
        return this.favoriteItemRepo.findByItemAndProfile(data);
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<FavoriteItem> {
        return this.create({
            data: data.params[0] // TODO: convert your params to FavoriteItemCreateRequest
        });
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
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<FavoriteItem> {
        return this.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to FavoriteItemUpdateRequest
        });
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

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.favoriteItemRepo.destroy(id);
    }

    /**
     * data[]:
     *  [0]: item_id
     *  [1]: profile_id
     *
     * remove favorite by listing id and profile id
     */
    public async removeFavorite(data: any): Promise<void> {
        const favoriteItem = await this.findByItemAndProfile(data);
        if (favoriteItem === null) {
            this.log.warn(`FavoriteItem with the id=${data[0]} was not found!`);
            throw new NotFoundException(data[0]);
        }
        await this.favoriteItemRepo.destroy(favoriteItem.id);
    }

}
