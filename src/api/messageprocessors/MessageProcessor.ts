// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import { EventEmitter } from '../../core/api/events';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { SmsgMessageService } from '../services/SmsgMessageService';
import { SmsgMessageSearchParams } from '../requests/SmsgMessageSearchParams';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { SearchOrder } from '../enums/SearchOrder';
import { MarketplaceMessageEvent } from '../messages/MarketplaceMessageEvent';
import { SmsgMessageFactory } from '../factories/model/SmsgMessageFactory';
import { MessageException } from '../exceptions/MessageException';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { GovernanceAction } from '../enums/GovernanceAction';
import { ActionMessageTypes } from '../enums/ActionMessageTypes';

export class MessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private interval: any;
    private pollCount = 0;

    private DEFAULT_INTERVAL = 5 * 1000;

    private LISTINGITEM_MESSAGES = [MPAction.MPA_LISTING_ADD];
    private BID_MESSAGES = [MPAction.MPA_BID, MPAction.MPA_ACCEPT, MPAction.MPA_REJECT, MPAction.MPA_CANCEL];
    private ESCROW_MESSAGES = [MPAction.MPA_LOCK, MPAction.MPA_RELEASE, MPAction.MPA_REFUND];
    private PROPOSAL_MESSAGES = [GovernanceAction.MPA_PROPOSAL_ADD];
    private VOTE_MESSAGES = [GovernanceAction.MPA_VOTE];

    // tslint:disable:max-line-length
    constructor(
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) private smsgMessageFactory: SmsgMessageFactory,
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
     * @param {module:resources.SmsgMessage[]} smsgMessages
     * @param {boolean} emitEvent, used for testing
     * @returns {Promise<void>}
     */
    public async process(smsgMessages: resources.SmsgMessage[], emitEvent: boolean = true): Promise<void> {

        for (const smsgMessage of smsgMessages) {

            this.log.debug('PROCESSING: ', smsgMessage.msgid);

            // this.log.debug('smsgMessage:', JSON.stringify(smsgMessage, null, 2));

            const marketplaceMessage: MarketplaceMessage | null = await this.smsgMessageFactory.getMarketplaceMessage(smsgMessage)
                .then(value => value)
                .catch(async reason => {
                    this.log.error('Could not parse the MarketplaceMessage.');
                    return null;
                });
            const eventType: string | null = await this.getEventForMessageType(smsgMessage.type);

            // this.log.debug('marketplaceMessage:', JSON.stringify(marketplaceMessage, null, 2));
            // this.log.debug('eventType:', JSON.stringify(eventType, null, 2));
            // this.log.debug('emitEvent:', JSON.stringify(emitEvent, null, 2));

            if (marketplaceMessage !== null && eventType !== null && emitEvent) {
                smsgMessage.text = '';

                const marketplaceEvent: MarketplaceMessageEvent = {
                    smsgMessage,
                    marketplaceMessage
                };

                this.log.debug('SMSGMESSAGE: '
                    + smsgMessage.from + ' => ' + smsgMessage.to
                    + ' : ' + smsgMessage.type
                    + ' : ' + smsgMessage.status
                    + ' : ' + smsgMessage.msgid);

                // this.log.debug('SENDING: ', eventType);

                // send event to the eventTypes processor
                this.eventEmitter.emit(eventType, marketplaceEvent);

                // send event to cli
                // todo: send marketplaceEvent to Cli
                this.eventEmitter.emit(Events.Cli, {
                    message: eventType,
                    data: marketplaceMessage
                });

            } else {
                // parsing failed, log some error data and update the smsgMessage
                this.log.error('marketplaceMessage:', JSON.stringify(marketplaceMessage, null, 2));
                this.log.error('eventType:', JSON.stringify(eventType, null, 2));
                this.log.error('emitEvent:', JSON.stringify(emitEvent, null, 2));
                this.log.error('PROCESSING: ' + smsgMessage.msgid + ' PARSING FAILED');
                await this.smsgMessageService.updateSmsgMessageStatus(smsgMessage, SmsgMessageStatus.PARSING_FAILED);
            }
        }
    }

    public stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }

    public schedulePoll(pollingInterval: number = this.DEFAULT_INTERVAL): void {
        this.interval = setInterval(() => {

            clearInterval(this.interval);
            this.poll().then(interval => {
                this.schedulePoll(interval); // re-run
            });

        }, pollingInterval);

    }

    /**
     * main poller
     *
     * @returns {Promise<void>}
     */
    public async poll(emitEvent: boolean = true): Promise<number> {  // public for tests

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

        // searchBy for different types of messages in order: proposal -> vote -> listingitem -> ...
        for (const params of searchParams) {

            // if we find messages, skip fetching more until we poll for more
            if (fetchNext) {
                // this.log.debug('MessageProcessor.poll #' + this.pollCount + ': find: ' + JSON.stringify(params));

                fetchNext = await this.getSmsgMessages(params.types, params.status, params.amount)
                    .then( async smsgMessages => {

                        // this.log.debug('searching: ' + params.types);

                        if (!_.isEmpty(smsgMessages)) {
                            // this.log.debug('poll(), smsgMessages: ' + JSON.stringify(smsgMessages, null, 2));
                            this.log.debug('poll(), smsgMessages.length: ' + smsgMessages.length);

                            for (const smsgMessage of smsgMessages) {
                                await this.smsgMessageService.updateSmsgMessageStatus(smsgMessage, SmsgMessageStatus.PROCESSING)
                                    .then(value => {
                                        const msg: resources.SmsgMessage = value.toJSON();
                                        if (msg.status !== SmsgMessageStatus.PROCESSING) {
                                            throw new MessageException('Failed to set SmsgMessageStatus.');
                                        }
                                    });

                                smsgMessage.status = SmsgMessageStatus.PROCESSING;
                            }
                            await this.process(smsgMessages, emitEvent);

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
                // this.log.debug('Messageprocessor.poll(), fetchNext: ', fetchNext);
            }
        }

        // this.log.debug('MessageProcessor.poll #' + this.pollCount + ': ' + (new Date().getTime() - startTime) + 'ms');
        this.pollCount++;

        return nextInterval;
    }

    /**
     *
     * @param {any[]} types
     * @param {SmsgMessageStatus} status
     * @param {number} amount
     * @returns {Promise<module:resources.SmsgMessage[]>}
     */
    // TODO: why types: any[]?
    private async getSmsgMessages(types: ActionMessageTypes[],
                                  status: SmsgMessageStatus, amount: number = 10): Promise<resources.SmsgMessage[]> {

        const searchParams = {
            order: SearchOrder.DESC,
            orderByColumn: 'received',
            status,
            types,
            page: 0,
            pageLimit: amount,
            age: 1000 * 20
        } as SmsgMessageSearchParams;

        const messagesModel = await this.smsgMessageService.searchBy(searchParams);
        const messages = messagesModel.toJSON();

        if (messages.length > 0) {
            this.log.debug('found ' + messages.length + ' messages. types: [' + types + '], status: ' + status);
        }
        return messages;
    }

    // TODO: make this static?
    private async getEventForMessageType(messageType: ActionMessageTypes): Promise<string | null> {
        switch (messageType) {
            case MPAction.MPA_BID:
                return Events.BidReceivedEvent;
            case MPAction.MPA_ACCEPT:
                return Events.AcceptBidReceivedEvent;
            case MPAction.MPA_REJECT:
                return Events.RejectBidReceivedEvent;
            case MPAction.MPA_CANCEL:
                return Events.CancelBidReceivedEvent;
            case MPAction.MPA_LOCK:
                return Events.LockEscrowReceivedEvent;
            case MPAction.MPA_REFUND:
                return Events.RefundEscrowReceivedEvent;
            case MPAction.MPA_RELEASE:
                return Events.ReleaseEscrowReceivedEvent;
            case GovernanceAction.MPA_PROPOSAL_ADD:
                return Events.ProposalReceivedEvent;
            case GovernanceAction.MPA_VOTE:
                return Events.VoteReceivedEvent;
            case MPAction.MPA_LISTING_ADD:
                return Events.ListingItemReceivedEvent;
            default:
                return null;
        }
    }
}
