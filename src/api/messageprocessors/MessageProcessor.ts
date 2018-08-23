// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';

import { EventEmitter } from '../../core/api/events';

import { MessageProcessorInterface } from './MessageProcessorInterface';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { BidMessageType } from '../enums/BidMessageType';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import { InternalServerException } from '../exceptions/InternalServerException';

import { ProposalMessageType } from '../enums/ProposalMessageType';
import { VoteMessageType } from '../enums/VoteMessageType';
import * as resources from 'resources';
import { SmsgMessageService } from '../services/SmsgMessageService';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';
import { SmsgMessageSearchParams } from '../requests/SmsgMessageSearchParams';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { SearchOrder } from '../enums/SearchOrder';
import {SmsgMessage} from '../models/SmsgMessage';
import {SmsgMessageUpdateRequest} from '../requests/SmsgMessageUpdateRequest';
import {IsNotEmpty} from 'class-validator';

export class MessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private timeout: any;
    private interval = 5000;

    // tslint:disable:max-line-length
    constructor(
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
     * @param {SmsgMessage[]} messages
     * @returns {Promise<void>}
     */
    public async process(messages: resources.SmsgMessage[]): Promise<void> {

        for (const message of messages) {
            this.log.debug('processing...');

/*
            let parsed: MarketplaceMessage | any;
            parsed = await this.parseJSONSafe(message.text)
                .then(value => {
                    return value;
                })
                .catch(reason => {
                    this.log.debug('parse error:' + reason);
                    return null;
                });
            delete message.text;

            if (parsed) {
                parsed.market = message.to;

                // in case of ListingItemMessage
                if (parsed.item) {

                    // const messageForLogging = JSON.parse(JSON.stringify(parsed.item));
                    // delete messageForLogging.information.images;
                    this.log.debug('==] poll(), new ListingItemMessage [============================================');
                    // this.log.debug('content:', JSON.stringify(messageForLogging, null, 2));
                    this.log.debug('from:', message.from);
                    this.log.debug('to:', message.to);
                    this.log.debug('sent:', message.sent);
                    this.log.debug('received:', message.received);
                    this.log.debug('msgid:', message.msgid);
                    this.log.debug('==] poll(), new ListingItemMessage, end [=======================================');

                    // ListingItemMessage, listingitemservice listens for this event
                    this.eventEmitter.emit(Events.ListingItemReceivedEvent, {
                        smsgMessage: message,
                        marketplaceMessage: parsed
                    } as MarketplaceEvent);

                    // send event to cli
                    this.eventEmitter.emit(Events.Cli, {
                        message: Events.ListingItemReceivedEvent,
                        data: parsed
                    });

                // in case of ActionMessage, which is either BidMessage or EscrowMessage
                } else if (parsed.mpaction) {
                    // const messageForLogging = JSON.parse(JSON.stringify(parsed.mpaction));
                    this.log.debug('==] poll(), new ActionMessage [===============================================');
                    // this.log.debug('content:', JSON.stringify(messageForLogging, null, 2));
                    this.log.debug('from:', message.from);
                    this.log.debug('to:', message.to);
                    this.log.debug('sent:', message.sent);
                    this.log.debug('received:', message.received);
                    this.log.debug('msgid:', message.msgid);
                    this.log.debug('==] poll(), new ActionMessage, end [==========================================');

                    // ActionMessage
                    const eventType = await this.getActionEventType(parsed.mpaction);
                    this.eventEmitter.emit(eventType, {
                        smsgMessage: message,
                        marketplaceMessage: parsed
                    });

                    // send event to cli
                    this.eventEmitter.emit(Events.Cli, {
                        message: eventType,
                        data: parsed
                    });

                } else {
                    // json object, but not something that we're expecting
                    this.log.error('received something unexpected: ', JSON.stringify(parsed, null, 2));
                }
            }
*/
            await this.updateSmsgMessageStatus(message, SmsgMessageStatus.PROCESSED);

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

        // fetch and process oldest 10 new listingitems
        await this.getSmsgMessages(ListingItemMessageType.MP_ITEM_ADD, SmsgMessageStatus.NEW, 10)
            .then( async smsgMessages => {
                await this.process(smsgMessages);
            })
            .catch( reason => {
                this.log.error('poll(), error: ' + reason);
                return;
            });
    }

    /**
     *
     * @param {ListingItemMessageType | BidMessageType | EscrowMessageType | ProposalMessageType | VoteMessageType} type
     * @param {SmsgMessageStatus} status
     * @param {number} count
     * @returns {Promise<module:resources.SmsgMessage[]>}
     */
    private async getSmsgMessages(type: ListingItemMessageType | BidMessageType | EscrowMessageType | ProposalMessageType | VoteMessageType,
                                  status: SmsgMessageStatus, count: number = 10): Promise<resources.SmsgMessage[]> {

        const searchParams = new SmsgMessageSearchParams({
            order: SearchOrder.DESC,
            orderByColumn: 'received',
            status,
            type,
            count,
            age: 1000 * 20
        });
        const messagesModel = await this.smsgMessageService.searchBy(searchParams);
        const messages = messagesModel.toJSON();
        this.log.debug('fetched ' + messages.length + ' messages. type: ' + type + ', status: ' + status);
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
            type: message.type,
            status,
            msgid: message.msgid,
            version: message.version,
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

    private async parseJSONSafe(json: string): Promise<MarketplaceMessage|null> {
        let parsed = null;
        try {
           // this.log.debug('json to parse:', json);
            parsed = JSON.parse(json);
        } catch (e) {
            this.log.error('parseJSONSafe, invalid JSON:', json);
            return null;
        }
        return parsed;
    }

    private async getActionEventType(message: ActionMessageInterface): Promise<string> {
        switch (message.action) {
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
                throw new InternalServerException('Unknown action message.');
        }
    }
}
