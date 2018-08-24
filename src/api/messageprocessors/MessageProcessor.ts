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
    private interval = 5000;
    private pollCount = 0;

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

            const marketplaceMessage: MarketplaceMessage | null = await this.smsgMessageFactory.getMarketplaceMessage(smsgMessage);
            const eventType: string | null = await this.getEventForMessageType(smsgMessage.type);

            if (!_.isNull(marketplaceMessage) && !_.isNull(eventType)) {

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
                await this.updateSmsgMessageStatus(smsgMessage, SmsgMessageStatus.PARSING_FAILED);
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
                await this.poll();
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
    private async poll(): Promise<void> {

        const startTime = new Date().getTime();

        let fetchNext = true;

        const searchParams = [
            {types: this.PROPOSAL_MESSAGES,     status: SmsgMessageStatus.NEW,      count: 10}, // fetch and process new ProposalMessages
            {types: this.VOTE_MESSAGES,         status: SmsgMessageStatus.NEW,      count: 10}, // fetch and process new VoteMessages
            {types: this.LISTINGITEM_MESSAGES,  status: SmsgMessageStatus.NEW,      count: 10}, // fetch and process new ListingItemMessages
            {types: this.BID_MESSAGES,          status: SmsgMessageStatus.NEW,      count: 10}, // fetch and process new BidMessages
            {types: this.ESCROW_MESSAGES,       status: SmsgMessageStatus.NEW,      count: 10}, // fetch and process new EscrowMessages
            {types: [],                         status: SmsgMessageStatus.WAITING,  count: 10}  // fetch and process the waiting ones
        ];

        for (const params of searchParams) {
            if (fetchNext) {
                fetchNext = await this.getSmsgMessages(params.types, params.status, params.count)
                    .then( async smsgMessages => {
                        if (!_.isEmpty(smsgMessages)) {
                            for (const smsgMessage of smsgMessages) {
                                const updated = await this.updateSmsgMessageStatus(smsgMessage, SmsgMessageStatus.PROCESSING);
                                smsgMessage.status = SmsgMessageStatus.PROCESSING;
                            }
                            await this.process(smsgMessages);
                            return false;
                        } else {
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
            count,
            age: 1000 * 20
        } as SmsgMessageSearchParams;

        const messagesModel = await this.smsgMessageService.searchBy(searchParams);
        const messages = messagesModel.toJSON();

        if (messages.length > 0) {
            this.log.debug('found ' + messages.length + ' messages. types: [' + types + '], status: ' + status);
        }
        return messages;
    }

    /**
     * update the status of the processed message, clean the text field if processing was successfull
     *
     * @param {module:resources.SmsgMessage} message
     * @param {SmsgMessageStatus} status
     * @returns {Promise<module:resources.SmsgMessage>}
     */
    private async updateSmsgMessageStatus(message: resources.SmsgMessage, status: SmsgMessageStatus): Promise<resources.SmsgMessage> {

        const text = status === SmsgMessageStatus.PROCESSED ? '' : message.text;

        const updateRequest = {
            type: message.type.toString(),
            status,
            msgid: message.msgid,
            version: message.version,
            read: message.read,
            paid: message.paid,
            payloadsize: message.payloadsize,
            received: message.received,
            sent: message.sent,
            expiration: message.expiration,
            daysretention: message.daysretention,
            from: message.from,
            to: message.to,
            text
        } as SmsgMessageUpdateRequest;

        // this.log.debug('message:', JSON.stringify(message, null, 2));
        // this.log.debug('updateRequest:', JSON.stringify(updateRequest, null, 2));

        const messageModel = await this.smsgMessageService.update(message.id, updateRequest);
        const updatedMessage = messageModel.toJSON();
        return updatedMessage;
    }

    private async getEventForMessageType(
        messageType: ListingItemMessageType | BidMessageType | EscrowMessageType | ProposalMessageType | VoteMessageType):
        Promise<string | null> {

        switch (messageType) {
            case EscrowMessageType.MPA_LOCK:
                return Events.LockEscrowReceivedEvent;
            case EscrowMessageType.MPA_REQUEST_REFUND:
                return Events.RequestRefundEscrowReceivedEvent;
            case EscrowMessageType.MPA_REFUND:
                return Events.RefundEscrowReceivedEvent;
            case EscrowMessageType.MPA_RELEASE:
                return Events.ReleaseEscrowReceivedEvent;
            case BidMessageType.MPA_BID:
                return Events.BidReceivedEvent;
            case BidMessageType.MPA_ACCEPT:
                return Events.AcceptBidReceivedEvent;
            case BidMessageType.MPA_REJECT:
                return Events.RejectBidReceivedEvent;
            case BidMessageType.MPA_CANCEL:
                return Events.CancelBidReceivedEvent;
            case ProposalMessageType.MP_PROPOSAL_ADD:
                return Events.ProposalReceivedEvent;
            case VoteMessageType.MP_VOTE:
                return Events.VoteReceivedEvent;
            default:
                return null;
        }
    }
}
