/// <reference types="node" />
import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { BidRepository } from '../repositories/BidRepository';
import { Bid } from '../models/Bid';
import { BidCreateRequest } from '../requests/BidCreateRequest';
import { BidUpdateRequest } from '../requests/BidUpdateRequest';
import { BidSearchParams } from '../requests/BidSearchParams';
import { EventEmitter } from 'events';
import { BidDataService } from './BidDataService';
import { ListingItemService } from './ListingItemService';
import { AddressService } from './AddressService';
import { ProfileService } from './ProfileService';
export declare class BidService {
    bidRepo: BidRepository;
    bidDataService: BidDataService;
    listingItemService: ListingItemService;
    addressService: AddressService;
    profileService: ProfileService;
    eventEmitter: EventEmitter;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(bidRepo: BidRepository, bidDataService: BidDataService, listingItemService: ListingItemService, addressService: AddressService, profileService: ProfileService, eventEmitter: EventEmitter, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<Bid>>;
    findOne(id: number, withRelated?: boolean): Promise<Bid>;
    findAllByHash(hash: string, withRelated?: boolean): Promise<Bookshelf.Collection<Bid>>;
    /**
     * search Bid using given BidSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    search(options: BidSearchParams, withRelated?: boolean): Promise<Bookshelf.Collection<Bid>>;
    getLatestBid(listingItemId: number, bidder: string): Promise<Bid>;
    create(data: BidCreateRequest): Promise<Bid>;
    update(id: number, data: BidUpdateRequest): Promise<Bid>;
    destroy(id: number): Promise<void>;
}
