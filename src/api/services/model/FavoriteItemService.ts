// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { FavoriteItemRepository } from '../../repositories/FavoriteItemRepository';
import { FavoriteItem } from '../../models/FavoriteItem';
import { FavoriteItemCreateRequest } from '../../requests/model/FavoriteItemCreateRequest';
import { FavoriteItemUpdateRequest } from '../../requests/model/FavoriteItemUpdateRequest';
import { ListingItemService } from './ListingItemService';
import { ProfileService } from './ProfileService';

export class FavoriteItemService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.FavoriteItemRepository) public favoriteItemRepo: FavoriteItemRepository,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
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
     * searchBy favorite item by profileId and itemId
     *
     * @param {number} profileId
     * @param {number} itemId
     * @param {boolean} withRelated
     * @returns {Promise<FavoriteItem>}
     */
    public async findOneByProfileIdAndListingItemId(profileId: number, itemId: number, withRelated: boolean = true): Promise<FavoriteItem> {
        const favoriteItem = await this.favoriteItemRepo.findOneByProfileIdAndListingItemId(profileId, itemId, withRelated);
        if (favoriteItem === null) {
            this.log.warn(`FavoriteItem with the profileId=${profileId} or listingItemId=${itemId} was not found!`);
            throw new NotFoundException(profileId + ' or ' + itemId);
        }
        return favoriteItem;
    }

    /**
     * find favorite item by profileId
     *
     * @param profileId
     * @param withRelated
     * @returns {Promise<Bookshelf.Collection<FavoriteItem>> }
     */
    public async findAllByProfileId(profileId: number, withRelated: boolean): Promise<Bookshelf.Collection<FavoriteItem>> {
        return await this.favoriteItemRepo.findAllByProfileId(profileId, withRelated);
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
