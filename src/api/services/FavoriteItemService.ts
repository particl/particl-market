// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

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
import {RpcRequest} from '../requests/RpcRequest';

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
        return this.favoriteItemRepo.search(options);
    }

    /**
     * find favorite item by profileId
     *
     * @param profileId
     * @param withRelated
     * @returns {Promise<Bookshelf.Collection<FavoriteItem>> }
     */
    public async findFavoritesByProfileId(profileId: number, withRelated: boolean): Promise<Bookshelf.Collection<FavoriteItem>> {
        return this.favoriteItemRepo.findFavoritesByProfileId(profileId, withRelated);
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
     * data.params[]:
     *  [0]: item_id or hash
     *  [1]: profile_id or null
     *
     * when data.params[0] is number then findById, else findOneByHash
     * TODO: needs to be refactored
     *
     */
    public async getSearchParamsFromRpcRequest(data: RpcRequest): Promise<any> {
        if (data.params.length < 2) {
            this.log.warn(`Not enough parameters supplied.`);
            throw new MessageException('Not enough parameters supplied.');
        }
        let profileId = data.params[0];
        let itemId = data.params[1] || 0;

        if (profileId && typeof profileId === 'string') {
            const profileModel = await this.profileService.findOneByName(data.params[1]);
            const profile = profileModel.toJSON();
            profileId = profile.id;
        } else if (!profileId) {
            // if profile id not found in the params then find default profile
            const profile = await this.profileService.findOneByName('DEFAULT');
            profileId = profile.id;
        }

        // if item hash is in the params
        if (itemId && typeof itemId === 'string') {
            const listingItemModel = await this.listingItemService.findOneByHash(itemId);
            const listingItem = listingItemModel.toJSON();
            itemId = listingItem.id;
        }
        // find listing item by id
        const item = await this.listingItemService.findOne(itemId);

        if (item === null) {
            this.log.warn(`ListingItem with the id=${itemId} was not found!`);
            throw new NotFoundException(itemId);
        }
        return [profileId, item.id];
    }

}
