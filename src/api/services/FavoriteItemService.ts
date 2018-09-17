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
     *
     */
    public async getSearchParams(data: any): Promise<any> {
        if (data.params.length < 2) {
            this.log.warn(`Not enough parameters supplied.`);
            throw new MessageException('Not enough parameters supplied.');
        }
        let profileId = data.params[0];
        let itemId = data.params[1] || 0;

        if (typeof profileId !== 'number') {
            this.log.warn(`Profile id must be numeric.`);
            throw new MessageException('Profile id must be numeric.');
        }

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
