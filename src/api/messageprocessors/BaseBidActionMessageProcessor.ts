// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { injectable } from 'inversify';
import { SmsgMessageService } from '../services/model/SmsgMessageService';
import { Logger as LoggerType } from '../../core/Logger';
import { ActionMessageTypes } from '../enums/ActionMessageTypes';
import { BidService } from '../services/model/BidService';
import { ProposalService } from '../services/model/ProposalService';
import { BidCreateRequest } from '../requests/model/BidCreateRequest';
import { BidCreateParams } from '../factories/model/ModelCreateParams';
import { ListingItemService } from '../services/model/ListingItemService';
import { BidFactory } from '../factories/model/BidFactory';
import { BaseActionMessageProcessor } from './BaseActionMessageProcessor';
import { BidAcceptMessage } from '../messages/action/BidAcceptMessage';
import { BidCancelMessage } from '../messages/action/BidCancelMessage';
import { BidRejectMessage } from '../messages/action/BidRejectMessage';
import { EscrowCompleteMessage } from '../messages/action/EscrowCompleteMessage';
import { EscrowReleaseMessage } from '../messages/action/EscrowReleaseMessage';
import { EscrowRefundMessage } from '../messages/action/EscrowRefundMessage';
import { EscrowLockMessage } from '../messages/action/EscrowLockMessage';
import { OrderItemShipMessage } from '../messages/action/OrderItemShipMessage';

export type ChildBidActionMessages = BidAcceptMessage | BidCancelMessage | BidRejectMessage | OrderItemShipMessage
    | EscrowCompleteMessage | EscrowLockMessage | EscrowRefundMessage | EscrowReleaseMessage;

@injectable()
export abstract class BaseBidActionMessageProcessor extends BaseActionMessageProcessor {

    public listingItemService: ListingItemService;
    public bidFactory: BidFactory;

    constructor(eventType: ActionMessageTypes, smsgMessageService: SmsgMessageService, bidService: BidService,
                proposalService: ProposalService, listingItemService: ListingItemService,
                bidFactory: BidFactory, Logger: typeof LoggerType) {
        super(eventType, smsgMessageService, bidService, proposalService, Logger);

        this.listingItemService = listingItemService;
        this.bidFactory = bidFactory;
    }

    public async createChildBidCreateRequest(actionMessage: ChildBidActionMessages, smsgMessage: resources.SmsgMessage): Promise<BidCreateRequest> {

        // - first get the previous Bid (MPA_BID), fail if it doesn't exist
        // - then get the ListingItem the Bid is for, fail if it doesn't exist
        // - create and return BidCreateRequest

        const mpaBid: resources.Bid = await this.bidService.findOneByHash(actionMessage.bid).then(value => value.toJSON());
        const listingItem: resources.ListingItem = await this.listingItemService.findOne(mpaBid.ListingItem.id).then(value => value.toJSON());

        const bidCreateParams = {
            msgid: smsgMessage.msgid,
            listingItem,
            bidder: smsgMessage.to,
            parentBid: mpaBid
        } as BidCreateParams;

        return await this.bidFactory.get(bidCreateParams, actionMessage, smsgMessage);
    }

}
