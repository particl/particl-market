import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import * as resources from 'resources';

import { NotFoundException } from '../exceptions/NotFoundException';
import { ValidationException } from '../exceptions/ValidationException';

import { BidRepository } from '../repositories/BidRepository';

import { Bid } from '../models/Bid';
import { ActionMessage } from '../models/ActionMessage';

import { BidCreateRequest } from '../requests/BidCreateRequest';
import { BidUpdateRequest } from '../requests/BidUpdateRequest';
import { BidDataCreateRequest } from '../requests/BidDataCreateRequest';
import { BidSearchParams } from '../requests/BidSearchParams';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';

import { EventEmitter } from 'events';
import { BidDataService } from './BidDataService';
import { ActionMessageService } from './ActionMessageService';


export class BidService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.BidRepository) public bidRepo: BidRepository,
        @inject(Types.Service) @named(Targets.Service.BidDataService) public bidDataService: BidDataService,
        @inject(Types.Service) @named(Targets.Service.ActionMessageService) public actionMessageService: ActionMessageService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
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

    public async findAllByHash(hash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Bid>> {
        const params = {
            listingItemHash: hash
        } as BidSearchParams;
        return this.search(params);
    }

    /**
     * search Bid using given BidSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    @validate()
    public async search(@request(BidSearchParams) options: BidSearchParams, withRelated: boolean = true): Promise<Bookshelf.Collection<Bid>> {
        return this.bidRepo.search(options, withRelated);
    }

    @validate()
    public async getLatestBid(listingItemId: number): Promise<Bid> {
        return await this.bidRepo.getLatestBid(listingItemId);
    }

    @validate()
    public async create(@request(BidCreateRequest) data: BidCreateRequest): Promise<Bid> {

        const body = JSON.parse(JSON.stringify(data));

        // bid needs to be related to listing item
        if (body.listing_item_id == null) {
            throw new ValidationException('Request body is not valid', ['listing_item_id missing']);
        }

        const bidData = body.bidData || [];
        delete body.bidData;

        this.log.debug('body: ', body);
        // If the request body was valid we will create the bid
        const bid = await this.bidRepo.create(body);

        for (const dataToSave of bidData) {
            dataToSave.bid_id = bid.Id;
            await this.bidDataService.create(dataToSave as BidDataCreateRequest);
        }

        // finally find and return the created bid
        const newBid = await this.findOne(bid.Id);
        return newBid;
    }

    @validate()
    public async update(id: number, @request(BidUpdateRequest) body: BidUpdateRequest): Promise<Bid> {
        // TODO: this doesnt work, FIX
        // find the existing one without related
        const bid = await this.findOne(id, false);

        // set new values
        if (body.action) {
            bid.Action = body.action;
        }

        // update bid record
        const updatedBid = await this.bidRepo.update(id, bid.toJSON());

        // return newBid;
        return updatedBid;
    }

    public async destroy(id: number): Promise<void> {
        await this.bidRepo.destroy(id);
    }

    /**
     * process received BidMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    /**
     * process received AcceptBidMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processAcceptBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    /**
     * process received CancelBidMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processCancelBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    /**
     * process received RejectBidMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processRejectBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    private configureEventListeners(): void {
        this.eventEmitter.on(Events.BidReceivedEvent, async (event) => {
            await this.processBidReceivedEvent(event);
        });
        this.eventEmitter.on(Events.AcceptBidReceivedEvent, async (event) => {
            await this.processAcceptBidReceivedEvent(event);
        });
        this.eventEmitter.on(Events.CancelBidReceivedEvent, async (event) => {
            await this.processCancelBidReceivedEvent(event);
        });
        this.eventEmitter.on(Events.RejectBidReceivedEvent, async (event) => {
            await this.processRejectBidReceivedEvent(event);
        });
    }



}
