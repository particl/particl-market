// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { ValidationException } from '../../exceptions/ValidationException';
import { ListingItemObjectRepository } from '../../repositories/ListingItemObjectRepository';
import { ListingItemObject } from '../../models/ListingItemObject';
import { ListingItemObjectCreateRequest } from '../../requests/model/ListingItemObjectCreateRequest';
import { ListingItemObjectUpdateRequest } from '../../requests/model/ListingItemObjectUpdateRequest';
import { ListingItemObjectSearchParams } from '../../requests/search/ListingItemObjectSearchParams';
import { ListingItemObjectDataService } from './ListingItemObjectDataService';

export class ListingItemObjectService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ListingItemObjectDataService) private listingItemObjectDataService: ListingItemObjectDataService,
        @inject(Types.Repository) @named(Targets.Repository.ListingItemObjectRepository) public listingItemObjectRepo: ListingItemObjectRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ListingItemObject>> {
        return this.listingItemObjectRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ListingItemObject> {
        const listingItemObject = await this.listingItemObjectRepo.findOne(id, withRelated);
        if (listingItemObject === null) {
            this.log.warn(`ListingItemObject with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return listingItemObject;
    }

    /**
     * searchBy ListingItemObject using given ListingItemObjectSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<ListingItemObject>>}
     */
    @validate()
    public async search(
        @request(ListingItemObjectSearchParams) options: ListingItemObjectSearchParams): Promise<Bookshelf.Collection<ListingItemObject>> {
        return this.listingItemObjectRepo.search(options);
    }

    @validate()
    public async create( @request(ListingItemObjectCreateRequest) data: ListingItemObjectCreateRequest): Promise<ListingItemObject> {
        const body: ListingItemObjectCreateRequest = JSON.parse(JSON.stringify(data));

        if (body.listing_item_id == null && body.listing_item_template_id == null) {
            throw new ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
        }

        const listingItemObjectDatas = body.listingItemObjectDatas || [];
        delete body.listingItemObjectDatas;

        const listingItemObject: resources.ListingItemObject = await this.listingItemObjectRepo.create(body).then(value => value.toJSON());

        for (const objectData of listingItemObjectDatas) {
            objectData.listing_item_object_id = listingItemObject.id;
            await this.listingItemObjectDataService.create(objectData);
        }
        return await this.findOne(listingItemObject.id);
    }

    @validate()
    public async update(id: number, @request(ListingItemObjectUpdateRequest) data: ListingItemObjectUpdateRequest): Promise<ListingItemObject> {

        const body = JSON.parse(JSON.stringify(data));

        const listingItemObject = await this.findOne(id, false);

        listingItemObject.Type = body.type;
        listingItemObject.Description = body.description;
        listingItemObject.Order = body.order;
        // todo: objectid?
        // todo: forceinput?

        const listingItemObjectToSave = listingItemObject.toJSON();
        const updatedListingItemObject = await this.listingItemObjectRepo.update(id, listingItemObjectToSave);

        // update only if new data was passed
        if (!_.isEmpty(body.listingItemObjectDatas)) {

            // find related records and delete
            let listingItemObjectDatas = updatedListingItemObject.related('ListingItemObjectDatas').toJSON();
            for (const objectData of listingItemObjectDatas) {
                await this.listingItemObjectDataService.destroy(objectData.id);
            }

            // recreate related data
            listingItemObjectDatas = body.listingItemObjectDatas || [];
            if (!_.isEmpty(listingItemObjectDatas)) {
                for (const objectData of listingItemObjectDatas) {
                    objectData.listing_item_object_id = id;
                    await this.listingItemObjectDataService.create(objectData);
                }
            }
        }
        return await this.findOne(id);
    }

    public async destroy(id: number): Promise<void> {
        await this.listingItemObjectRepo.destroy(id);
    }
}

