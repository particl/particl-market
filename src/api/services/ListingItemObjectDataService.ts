import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ListingItemObjectDataRepository } from '../repositories/ListingItemObjectDataRepository';
import { ListingItemObjectData } from '../models/ListingItemObjectData';
import { ListingItemObjectDataCreateRequest } from '../requests/ListingItemObjectDataCreateRequest';
import { ListingItemObjectDataUpdateRequest } from '../requests/ListingItemObjectDataUpdateRequest';


export class ListingItemObjectDataService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ListingItemObjectDataRepository) public listingItemObjectDataRepo: ListingItemObjectDataRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ListingItemObjectData>> {
        return this.listingItemObjectDataRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ListingItemObjectData> {
        const listingItemObjectData = await this.listingItemObjectDataRepo.findOne(id, withRelated);
        if (listingItemObjectData === null) {
            this.log.warn(`ListingItemObjectData with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return listingItemObjectData;
    }

    @validate()
    public async create( @request(ListingItemObjectDataCreateRequest) body: ListingItemObjectDataCreateRequest): Promise<ListingItemObjectData> {

        // If the request body was valid we will create the listingItemObjectData
        const listingItemObjectData = await this.listingItemObjectDataRepo.create(body);

        const newListingItemObjectData = await this.findOne(listingItemObjectData.id);
        return newListingItemObjectData;
    }

    @validate()
    public async update(id: number, @request(ListingItemObjectDataUpdateRequest) body: ListingItemObjectDataUpdateRequest): Promise<ListingItemObjectData> {

        // find the existing one without related
        const listingItemObjectData = await this.findOne(id, false);

        // set new values
        listingItemObjectData.Key = body.key;
        listingItemObjectData.Value = body.value;

        // update listingItemObjectData record
        const updatedListingItemObjectData = await this.listingItemObjectDataRepo.update(id, listingItemObjectData.toJSON());

        return updatedListingItemObjectData;
    }

    public async destroy(id: number): Promise<void> {
        await this.listingItemObjectDataRepo.destroy(id);
    }

}
