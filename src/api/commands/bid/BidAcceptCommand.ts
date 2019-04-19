// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemService } from '../../services/model/ListingItemService';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { BidService } from '../../services/model/BidService';
import { BidAcceptActionService } from '../../services/action/BidAcceptActionService';
import {MissingParamException} from '../../exceptions/MissingParamException';
import {InvalidParamException} from '../../exceptions/InvalidParamException';
import {ModelNotFoundException} from '../../exceptions/ModelNotFoundException';
import {BidAcceptRequest} from '../../requests/action/BidAcceptRequest';
import {AddressCreateRequest} from '../../requests/model/AddressCreateRequest';
import {SmsgSendParams} from '../../requests/action/SmsgSendParams';
import {BidRequest} from '../../requests/action/BidRequest';

export class BidAcceptCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.action.BidAcceptActionService) private bidAcceptActionService: BidAcceptActionService
    ) {
        super(Commands.BID_ACCEPT);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: bid, resources.Bid
     *
     * @param data
     * @returns {Promise<Bookshelf<Bid>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const bid: resources.Bid = data.params[0];

        const listingItem: resources.ListingItem = await this.listingItemService.findOne(bid.ListingItem.id)
            .then(value => value.toJSON());

        const profile: resources.Profile = listingItem.ListingItemTemplate.Profile;

        const fromAddress = profile.address;    // we are the seller, send from the profiles address which posted the item being bidded for
        const toAddress = bid.bidder;           // send to the address that sent the bid

        // TODO: currently hardcoded!!! parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10)
        const daysRetention = 2;
        const estimateFee = false;

        const postRequest = {
            sendParams: new SmsgSendParams(fromAddress, toAddress, false, daysRetention, estimateFee),
            bid
        } as BidAcceptRequest;

        return this.bidAcceptActionService.post(postRequest);
    }

    /**
     * data.params[]:
     * [0]: bidId
     *
     * TODO: instead of bidId, use bid.hash?
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('bidId');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('bidId', 'number');
        }

        const bid: resources.Bid = await this.bidService.findOne(data.params[0]).then(value => value.toJSON());
        data.params[0] = bid;

        // make sure ListingItem exists
        if (_.isEmpty(bid.ListingItem)) {
            this.log.error('ListingItem not found.');
            throw new ModelNotFoundException('ListingItem');
        }

        // make sure we have a ListingItemTemplate, so we know it's our item
        if (_.isEmpty(bid.ListingItem.ListingItemTemplate)) {
            this.log.error('Not your ListingItem.');
            throw new ModelNotFoundException('ListingItemTemplate');
        }

        // TODO: check that we are the seller

        return data;
    }

    public usage(): string {
        return this.getName() + ' <bidId>';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <bidId>                  - number - The id of the bid we want to accept. ';
    }

    public description(): string {
        return 'Accept bid.';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' 1';
    }
}
