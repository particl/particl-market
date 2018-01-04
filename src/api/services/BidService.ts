import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { BidRepository } from '../repositories/BidRepository';
import { Bid } from '../models/Bid';
import { BidCreateRequest } from '../requests/BidCreateRequest';
import { BidUpdateRequest } from '../requests/BidUpdateRequest';
import { BidSearchParams } from '../requests/BidSearchParams';
import { BidMessageType } from '../enums/BidMessageType';
import { BidDataService } from './BidDataService';


export class BidService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.BidRepository) public bidRepo: BidRepository,
        @inject(Types.Service) @named(Targets.Service.BidDataService) public bidDataService: BidDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Bid>> {
        return this.bidRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Bid> {
        const bid = await this.bidRepo.findOne(id, withRelated);
        if (bid === null) {
            this.log.warn(`Bid with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return bid;
    }

    /**
     * search Bid using given BidSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    @validate()
    public async search(
        @request(BidSearchParams) options: BidSearchParams,
        withRelated: boolean = true): Promise<Bookshelf.Collection<Bid>> {
        return this.bidRepo.search(options, withRelated);
    }

    @validate()
    public async getLatestBid(listingItemId: number): Promise<Bid> {
        return await this.bidRepo.getLatestBid(listingItemId);
    }

    @validate()
    public async create( @request(BidCreateRequest) body: BidCreateRequest): Promise<Bid> {

        // TODO: extract and remove related models from request
        const bidData = body.bidData || [];
        delete body.bidData;

        // If the request body was valid we will create the bid
        const bid = await this.bidRepo.create(body);

        // TODO: create related models
        for (const data of bidData) {
            data.bid_id = bid.Id;
            await this.bidDataService.create(data);
        }

        // finally find and return the created bid
        const newBid = await this.findOne(bid.id);
        return newBid;
    }

    @validate()
    public async update(id: number, @request(BidUpdateRequest) body: BidUpdateRequest): Promise<Bid> {
        // find the existing one without related
        const bid = await this.findOne(id, false);

        // set new values
        if (body.action) {
            bid.Action = body.action;
        }

        // update bid record
        const updatedBid = await this.bidRepo.update(id, bid.toJSON());

        // TODO: find related record and update it

        // TODO: finally find and return the updated bid
        // const newBid = await this.findOne(id);
        // return newBid;

        return updatedBid;
    }

    public async destroy(id: number): Promise<void> {
        await this.bidRepo.destroy(id);
    }

}
