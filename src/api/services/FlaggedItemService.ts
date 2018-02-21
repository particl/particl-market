import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { FlaggedItemRepository } from '../repositories/FlaggedItemRepository';
import { FlaggedItem } from '../models/FlaggedItem';
import { FlaggedItemCreateRequest } from '../requests/FlaggedItemCreateRequest';
import { FlaggedItemUpdateRequest } from '../requests/FlaggedItemUpdateRequest';

export class FlaggedItemService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.FlaggedItemRepository) public flaggedItemRepo: FlaggedItemRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<FlaggedItem>> {
        return this.flaggedItemRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<FlaggedItem> {
        const flaggedItem = await this.flaggedItemRepo.findOne(id, withRelated);
        if (flaggedItem === null) {
            this.log.warn(`FlaggedItem with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return flaggedItem;
    }

    @validate()
    public async create( @request(FlaggedItemCreateRequest) body: any): Promise<FlaggedItem> {

        // If the request body was valid we will create the flaggedItem
        const flaggedItem = await this.flaggedItemRepo.create(body);

        // finally find and return the created flaggedItem
        const newFlaggedItem = await this.findOne(flaggedItem.id);
        return newFlaggedItem;
    }

    @validate()
    public async update(id: number, @request(FlaggedItemUpdateRequest) body: any): Promise<FlaggedItem> {

        // find the existing one without related
        const flaggedItem = await this.findOne(id, false);

        // set new values
        flaggedItem.ListingItemId = body.listingItemId;

        // update flaggedItem record
        const updatedFlaggedItem = await this.flaggedItemRepo.update(id, flaggedItem.toJSON());

        // return newFlaggedItem;
        return updatedFlaggedItem;
    }

    public async destroy(id: number): Promise<void> {
        await this.flaggedItemRepo.destroy(id);
    }

}
