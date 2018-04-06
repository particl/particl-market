import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';

import { NotFoundException } from '../exceptions/NotFoundException';
import { ValidationException } from '../exceptions/ValidationException';

import { BidRepository } from '../repositories/BidRepository';

import { Bid } from '../models/Bid';

import { BidCreateRequest } from '../requests/BidCreateRequest';
import { BidUpdateRequest } from '../requests/BidUpdateRequest';
import { BidDataCreateRequest } from '../requests/BidDataCreateRequest';
import { BidSearchParams } from '../requests/BidSearchParams';

import { EventEmitter } from 'events';
import { BidDataService } from './BidDataService';
import { ListingItemService } from './ListingItemService';
import { AddressService } from './AddressService';
import { ProfileService } from './ProfileService';

export class BidService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.BidRepository) public bidRepo: BidRepository,
        @inject(Types.Service) @named(Targets.Service.BidDataService) public bidDataService: BidDataService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.AddressService) public addressService: AddressService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Bid>> {
        return await this.bidRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Bid> {
        const bid = await this.bidRepo.findOne(id, withRelated);
        if (bid === null) {
            this.log.warn(`Bid with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return bid;
    }

    public async findAllByHash(hash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Bid>> {
        // TODO: this does not seem to be implemented, see repo/model
        const params = {
            listingItemHash: hash
        } as BidSearchParams;
        return await this.search(params);
    }

    /**
     * search Bid using given BidSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    @validate()
    public async search(@request(BidSearchParams) options: BidSearchParams, withRelated: boolean = true): Promise<Bookshelf.Collection<Bid>> {

        // if item hash was given, set the item id
        if (options.listingItemHash) {
            const foundListing = await this.listingItemService.findOneByHash(options.listingItemHash, false);
            options.listingItemId = foundListing.Id;
        }
        return await this.bidRepo.search(options, withRelated);
    }

    @validate()
    public async getLatestBid(listingItemId: number, bidder: string): Promise<Bid> {
        return await this.bidRepo.getLatestBid(listingItemId, bidder);
    }

    @validate()
    public async create(@request(BidCreateRequest) data: BidCreateRequest): Promise<Bid> {

        const body = JSON.parse(JSON.stringify(data));
        this.log.debug('BidCreateRequest:', JSON.stringify(body, null, 2));

        // bid needs is related to listing item
        if (body.listing_item_id == null) {
            this.log.error('Request body is not valid, listing_item_id missing');
            throw new ValidationException('Request body is not valid', ['listing_item_id missing']);
        }

        // bid needs to have a bidder
        if (body.bidder == null) {
            this.log.error('Request body is not valid, bidder missing');
            throw new ValidationException('Request body is not valid', ['bidder missing']);
        }

        // shipping address
        if (body.address == null) {
            this.log.error('Request body is not valid, address missing');
            throw new ValidationException('Request body is not valid', ['address missing']);
        }

        const addressCreateRequest = body.address;
        delete body.address;

        this.log.debug('body.listing_item_id: ', body.listing_item_id);

        this.log.debug('address create request: ', JSON.stringify(addressCreateRequest, null, 2));
        const addressModel = await this.addressService.create(addressCreateRequest);
        const address = addressModel.toJSON();
        this.log.debug('created address: ', JSON.stringify(address, null, 2));

        // set the address_id for bid
        body.address_id = address.id;

        const bidDatas = body.bidDatas || [];
        delete body.bidDatas;

        // this.log.debug('body: ', JSON.stringify(body, null, 2));
        // If the request body was valid we will create the bid
        const bid = await this.bidRepo.create(body);

        for (const dataToSave of bidDatas) {
            // todo: move to biddataservice?
            dataToSave.bid_id = bid.Id;
            // todo: test with different types of dataValue
            dataToSave.dataValue = typeof (dataToSave.dataValue) === 'string' ? dataToSave.dataValue : JSON.stringify(dataToSave.dataValue);

            // this.log.debug('dataToSave: ', JSON.stringify(dataToSave, null, 2));
            await this.bidDataService.create(dataToSave);
        }

        // finally find and return the created bid
        const newBid = await this.findOne(bid.Id);
        return newBid;
    }

    @validate()
    public async update(id: number, @request(BidUpdateRequest) body: BidUpdateRequest): Promise<Bid> {

        // find the existing one without related
        const bid = await this.findOne(id, false);

        // set new values
        bid.Action = body.action;
        bid.Bidder = body.bidder;

        // update bid record
        const updatedBid = await this.bidRepo.update(id, bid.toJSON());

        // return newBid;
        return updatedBid;
    }

    public async destroy(id: number): Promise<void> {
        await this.bidRepo.destroy(id);
    }

}
