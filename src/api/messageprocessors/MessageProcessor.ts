// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';

import { EventEmitter } from '../../core/api/events';

import { MessageProcessorInterface } from './MessageProcessorInterface';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { BidMessageType } from '../enums/BidMessageType';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import { VoteMessageType } from '../enums/VoteMessageType';
import * as resources from 'resources';
import { SmsgMessageService } from '../services/SmsgMessageService';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';
import { SmsgMessageSearchParams } from '../requests/SmsgMessageSearchParams';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { SearchOrder } from '../enums/SearchOrder';
import { SmsgMessage } from '../models/SmsgMessage';
import { SmsgMessageUpdateRequest } from '../requests/SmsgMessageUpdateRequest';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { SmsgMessageFactory } from '../factories/SmsgMessageFactory';

export class MessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private timeout: any;
    private pollCount = 0;

    private DEFAULT_INTERVAL = 5 * 1000;
    private interval = this.DEFAULT_INTERVAL;

    private LISTINGITEM_MESSAGES = [ListingItemMessageType.MP_ITEM_ADD];
    private BID_MESSAGES = [BidMessageType.MPA_BID, BidMessageType.MPA_ACCEPT, BidMessageType.MPA_REJECT, BidMessageType.MPA_CANCEL];
    private ESCROW_MESSAGES = [EscrowMessageType.MPA_LOCK, EscrowMessageType.MPA_RELEASE, EscrowMessageType.MPA_REQUEST_REFUND, EscrowMessageType.MPA_REFUND];
    private PROPOSAL_MESSAGES = [ProposalMessageType.MP_PROPOSAL_ADD];
    private VOTE_MESSAGES = [VoteMessageType.MP_VOTE];

    // tslint:disable:max-line-length
    constructor(
        @inject(Types.Factory) @named(Targets.Factory.SmsgMessageFactory) private smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Service) @named(Targets.Service.SmsgMessageService) private smsgMessageService: SmsgMessageService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter
    ) {
        this.log = new Logger(__filename);
    }
    // tslint:enable:max-line-length

    /**
     * main messageprocessor, ...
     *
     * @param {SmsgMessage[]} smsgMessages
     * @returns {Promise<void>}
     */
    public async process(smsgMessages: resources.SmsgMessage[]): Promise<void> {

        for (const smsgMessage of smsgMessages) {

            this.log.debug('PROCESSING: ', smsgMessage.msgid);

            this.log.debug('smsgMessage:', JSON.stringify(smsgMessage, null, 2));

            // TODO: throw instead of returning null
            const marketplaceMessage: MarketplaceMessage | null = await this.smsgMessageFactory.getMarketplaceMessage(smsgMessage);
            const eventType: string | null = await this.getEventForMessageType(smsgMessage.type);

            this.log.debug('marketplaceMessage:', JSON.stringify(marketplaceMessage, null, 2));
            this.log.debug('eventType:', JSON.stringify(eventType, null, 2));

            if (marketplaceMessage !== null && eventType !== null) {

                // todo: check if this is actually necessary?
                marketplaceMessage.market = smsgMessage.to;
                smsgMessage.text = '';

                const marketplaceEvent: MarketplaceEvent = {
                    smsgMessage,
                    marketplaceMessage
                };

                this.log.debug('SMSGMESSAGE: '
                    + smsgMessage.from + ' => ' + smsgMessage.to
                    + ' : ' + smsgMessage.type
                    + ' : ' + smsgMessage.status
                    + ' : ' + smsgMessage.msgid);

                this.log.debug('SENDING: ', eventType);

                // send event to the eventTypes processor
                this.eventEmitter.emit(eventType, {
                    smsgMessage,
                    marketplaceMessage
                });

                // send event to cli
                this.eventEmitter.emit(Events.Cli, {
                    message: eventType,
                    data: marketplaceMessage
                });

            } else {
                await this.smsgMessageService.updateSmsgMessageStatus(smsgMessage, SmsgMessageStatus.PARSING_FAILED);
            }
        }
    }

    public stop(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

    public schedulePoll(): void {
        this.timeout = setTimeout(
            async () => {
                this.interval = await this.poll();
                this.schedulePoll();
            },
            this.interval
        );
    }

    /**
     * main poller
     *
     * @returns {Promise<void>}
     */
    private async poll(): Promise<number> {

        const startTime = new Date().getTime();

        // fetch and process new ProposalMessages
        // fetch and process new VoteMessages
        // fetch and process new ListingItemMessages
        // fetch and process new BidMessages
        // fetch and process new EscrowMessages
        // fetch and process the waiting ones

        const searchParams = [
            {types: this.PROPOSAL_MESSAGES,     status: SmsgMessageStatus.NEW,      amount: 10, nextInverval: this.DEFAULT_INTERVAL},
            {types: this.VOTE_MESSAGES,         status: SmsgMessageStatus.NEW,      amount: 10, nextInverval: this.DEFAULT_INTERVAL},
            {types: this.LISTINGITEM_MESSAGES,  status: SmsgMessageStatus.NEW,      amount: 1,  nextInverval: this.DEFAULT_INTERVAL},
            {types: this.BID_MESSAGES,          status: SmsgMessageStatus.NEW,      amount: 10, nextInverval: this.DEFAULT_INTERVAL},
            {types: this.ESCROW_MESSAGES,       status: SmsgMessageStatus.NEW,      amount: 10, nextInverval: this.DEFAULT_INTERVAL},
            {types: [],                         status: SmsgMessageStatus.WAITING,  amount: 10, nextInverval: this.DEFAULT_INTERVAL}
        ];

        let fetchNext = true;
        let nextInterval = 1000;

        // search for different types of messages in order: proposal -> vote -> listingitem -> ...
        for (const params of searchParams) {

            // if we find messages, skip fetching more until we poll for more
            if (fetchNext) {
                this.log.debug('MessageProcessor.poll #' + this.pollCount + ': find: ' + JSON.stringify(params));

                fetchNext = await this.getSmsgMessages(params.types, params.status, params.amount)
                    .then( async smsgMessages => {
                        if (!_.isEmpty(smsgMessages)) {
                            for (const smsgMessage of smsgMessages) {
                                await this.smsgMessageService.updateSmsgMessageStatus(smsgMessage, SmsgMessageStatus.PROCESSING);
                                smsgMessage.status = SmsgMessageStatus.PROCESSING;
                            }
                            await this.process(smsgMessages);

                            // we just processed certain types of messages, so skip processing the next types until we
                            // have processed all of these
                            return false;
                        } else {
                            nextInterval = params.nextInverval;

                            // move to process the next types of messages
                            return true;
                        }
                    })
                    .catch( reason => {
                        this.log.error('Messageprocessor.poll(), ERROR: ', reason);
                        return true;
                    });
            }
        }

        this.log.debug('MessageProcessor.poll #' + this.pollCount + ': ' + (new Date().getTime() - startTime) + 'ms');
        this.pollCount++;

        return nextInterval;
    }

    /**
     *
     * @param {any[]} types
     * @param {SmsgMessageStatus} status
     * @param {number} count
     * @returns {Promise<module:resources.SmsgMessage[]>}
     */
    private async getSmsgMessages(types: any[], // ListingItemMessageType | BidMessageType | EscrowMessageType | ProposalMessageType | VoteMessageType,
                                  status: SmsgMessageStatus, count: number = 10): Promise<resources.SmsgMessage[]> {

        const searchParams = {
            order: SearchOrder.DESC,
            orderByColumn: 'received',
            status,
            types,
            page: 0,
            pageLimit: count,
            age: 1000 * 20
        } as SmsgMessageSearchParams;

        const messagesModel = await this.smsgMessageService.searchBy(searchParams);
        const messages = messagesModel.toJSON();

        if (messages.length > 0) {
            this.log.debug('found ' + messages.length + ' messages. types: [' + types + '], status: ' + status);
        }
        return messages;
    }

    private async getEventForMessageType(
        messageType: ListingItemMessageType | BidMessageType | EscrowMessageType | ProposalMessageType | VoteMessageType):
        Promise<string | null> {

        switch (messageType) {
            case BidMessageType.MPA_BID:
                return Events.BidReceivedEvent;
            case BidMessageType.MPA_ACCEPT:
                return Events.AcceptBidReceivedEvent;
            case BidMessageType.MPA_REJECT:
                return Events.RejectBidReceivedEvent;
            case BidMessageType.MPA_CANCEL:
                return Events.CancelBidReceivedEvent;
            case EscrowMessageType.MPA_LOCK:
                return Events.LockEscrowReceivedEvent;
            case EscrowMessageType.MPA_REQUEST_REFUND:
                return Events.RequestRefundEscrowReceivedEvent;
            case EscrowMessageType.MPA_REFUND:
                return Events.RefundEscrowReceivedEvent;
            case EscrowMessageType.MPA_RELEASE:
                return Events.ReleaseEscrowReceivedEvent;
            case ProposalMessageType.MP_PROPOSAL_ADD:
                return Events.ProposalReceivedEvent;
            case VoteMessageType.MP_VOTE:
                return Events.VoteReceivedEvent;
            case ListingItemMessageType.MP_ITEM_ADD:
                return Events.ListingItemReceivedEvent;
            case ListingItemMessageType.UNKNOWN:
            default:
                return null;
        }
    }
}
