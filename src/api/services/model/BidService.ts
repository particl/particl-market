// Copyright (c) 2017-2019, The Particl Market developers
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
import { BidRepository } from '../../repositories/BidRepository';
import { Bid } from '../../models/Bid';
import { BidCreateRequest } from '../../requests/BidCreateRequest';
import { BidUpdateRequest } from '../../requests/BidUpdateRequest';
import { BidDataCreateRequest } from '../../requests/BidDataCreateRequest';
import { BidSearchParams } from '../../requests/BidSearchParams';
import { EventEmitter } from 'events';
import { BidDataService } from './BidDataService';
import { ListingItemService } from './ListingItemService';
import { AddressService } from './AddressService';
import { ProfileService } from './ProfileService';
import { SearchOrder } from '../../enums/SearchOrder';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MessageException } from '../../exceptions/MessageException';
import {ListingItem} from '../../models/ListingItem';

export class BidService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.BidRepository) public bidRepo: BidRepository,
        @inject(Types.Service) @named(Targets.Service.model.BidDataService) public bidDataService: BidDataService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.AddressService) public addressService: AddressService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
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

    public async findOneByHash(hash: string, withRelated: boolean = true): Promise<Bid> {
        const bid = await this.bidRepo.findOneByHash(hash, withRelated);
        if (bid === null) {
            this.log.warn(`Bid with the hash=${hash} was not found!`);
            throw new NotFoundException(hash);
        }
        return bid;
    }

    public async findOneByMsgId(msgId: string, withRelated: boolean = true): Promise<Bid> {
        const smsgMessage = await this.bidRepo.findOneByMsgId(msgId, withRelated);
        if (smsgMessage === null) {
            this.log.warn(`SmsgMessage with the msgid=${msgId} was not found!`);
            throw new NotFoundException(msgId);
        }
        return smsgMessage;
    }

    public async findAllByListingItemHash(hash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Bid>> {
        const params = {
            listingItemHash: hash
        } as BidSearchParams;
        return await this.search(params);
    }

    /**
     * searchBy Bid using given BidSearchParams
     *
     * @param options
     * @param withRelated
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
    public async getLatestBidByBidder(listingItemId: number, bidder: string): Promise<Bid> {
        // return await this.bidRepo.getLatestBid(listingItemId, bidder);
        return await this.search({
            listingItemId,
            bidders: [ bidder ],
            ordering: SearchOrder.DESC
        } as BidSearchParams, true)[0];
    }

    @validate()
    public async create(@request(BidCreateRequest) data: BidCreateRequest): Promise<Bid> {

        const body: BidCreateRequest = JSON.parse(JSON.stringify(data));
        // this.log.debug('BidCreateRequest:', JSON.stringify(body, null, 2));

        // MPAction.MPA_BID needs to contain shipping address, for other types its optional
        if (body.type === MPAction.MPA_BID) {
            if (!body.address && !body.address_id) {
                this.log.error('Request body is not valid, address missing');
                throw new ValidationException('Request body is not valid', ['address missing']);
            } else { // if (!body.address_id) {
                // no address_id -> create one
                // NOTE: in both cases, there should not be address_id set, as we want to create a new delivery address for each new bid

                const addressCreateRequest = body.address;
                delete body.address;

                // no profile_id set -> figure it out
                if (!addressCreateRequest.profile_id) {

                    // if local profile is the bidder...
                    addressCreateRequest.profile_id = await this.profileService.findOneByAddress(body.bidder)
                        .then(value => {
                            const bidderProfile: resources.Profile = value.toJSON();
                            return bidderProfile.id;
                        })
                        .catch(async reason => {
                            // local profile wasn't the bidder, so we must be the seller, fetch the Profile through the ListingItem
                            return await this.listingItemService.findOne(body.listing_item_id)
                                .then(value => {
                                    const listingItem: resources.ListingItem = value.toJSON();
                                    return listingItem.ListingItemTemplate.Profile.id;
                                })
                                .catch(reason1 => {
                                    this.log.error('Bid doesnt belong to any local Profile');
                                    throw new MessageException('Bid doesnt belong to any local Profile');
                                });
                        });
                }

                // this.log.debug('address create request: ', JSON.stringify(addressCreateRequest, null, 2));
                const address: resources.Address = await this.addressService.create(addressCreateRequest)
                    .then(value => value.toJSON());
                // this.log.debug('created address: ', JSON.stringify(address, null, 2));

                // set the address_id for the bid
                body.address_id = address.id;
            }

        } else {
            // Bid.type !== MPAction.MPA_BID needs to have a parent_bid_id
            if (!body.parent_bid_id) {
                this.log.error('Request body is not valid, parent_bid_id missing');
                throw new ValidationException('Request body is not valid', ['parent_bid_id missing']);
            }
        }

        const bidDatas = body.bidDatas || [];
        delete body.bidDatas;

        const bid: resources.Bid = await this.bidRepo.create(body).then(value => value.toJSON());

        for (const dataToSave of bidDatas) {
            dataToSave.bid_id = bid.id;
            await this.bidDataService.create(dataToSave);
        }

        return await this.findOne(bid.id, true);
    }

    @validate()
    public async update(id: number, @request(BidUpdateRequest) data: BidUpdateRequest): Promise<Bid> {

        const body: BidUpdateRequest = JSON.parse(JSON.stringify(data));

        // find the existing one without related
        const bid = await this.findOne(id, false);

        // extract and remove related models from request
        const bidDatas: BidDataCreateRequest[] = body.bidDatas || [];
        delete body.bidDatas;

        // set new values, we only need to change the type
        bid.Type = body.type;
        bid.Hash = body.hash;
        bid.GeneratedAt = body.generatedAt;

        // TODO: not sure if we should even allow updating the related bidDatas
        // update bid record
        const updatedBid = await this.bidRepo.update(id, bid.toJSON());

        // remove old BidDatas
        if (bidDatas) {
            const oldBidDatas = updatedBid.related('BidDatas').toJSON();
            for (const bidData of oldBidDatas) {
                await this.bidDataService.destroy(bidData.id);
            }

            // create new BidDatas
            for (const bidData of bidDatas) {
                bidData.bid_id = id;
                await this.bidDataService.create(bidData);
            }
        }

        return await this.findOne(id, true);
    }

    public async destroy(id: number): Promise<void> {
        await this.bidRepo.destroy(id);
    }
}
