import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';

import { EventEmitter } from '../../core/api/events';
import { SmsgMessage } from '../messages/SmsgMessage';
import { SmsgService } from '../services/SmsgService';

import { MessageProcessorInterface } from './MessageProcessorInterface';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ListingItemService } from '../services/ListingItemService';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { BidMessageType } from '../enums/BidMessageType';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import { InternalServerException } from '../exceptions/InternalServerException';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';

export class MessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private timeout: any;
    private interval = 5000;

    // TODO: injecting listingItemService causes Error: knex: Required configuration option 'client' is missing.
    // tslint:disable:max-line-length
    constructor(
        // @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) private smsgService: SmsgService,
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
    public async process(messages: SmsgMessage[]): Promise<void> {

        for (const message of messages) {
            const parsed: MarketplaceMessage | null = await this.parseJSONSafe(message.text);
            delete message.text;

            if (parsed) {
                parsed.market = message.to;

                // in case of ListingItemMessage
                if (parsed.item) {

                    const messageForLogging = JSON.parse(JSON.stringify(parsed.item));
                    delete messageForLogging.information.images;
                    this.log.debug('==] poll(), new ListingItemMessage [=============================================================');
                    this.log.debug('msgid:', message.msgid);
                    this.log.debug('from:', message.from);
                    this.log.debug('to:', message.to);
                    this.log.debug('sent:', message.sent);
                    this.log.debug('received:', message.received);
                    this.log.debug('content:', JSON.stringify(messageForLogging, null, 2));
                    this.log.debug('=================================================================================================');

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

                    const messageForLogging = JSON.parse(JSON.stringify(parsed.item));
                    this.log.debug('==] poll(), new ListingItemMessage [=============================================================');
                    this.log.debug('msgid:', message.msgid);
                    this.log.debug('from:', message.from);
                    this.log.debug('to:', message.to);
                    this.log.debug('sent:', message.sent);
                    this.log.debug('received:', message.received);
                    this.log.debug('content:', JSON.stringify(messageForLogging, null, 2));
                    this.log.debug('=================================================================================================');

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
        await this.pollMessages()
            .then( async messages => {
                if (messages.result !== '0') {
                    const smsgMessages: SmsgMessage[] = messages.messages;
                    await this.process(smsgMessages);
                }
                return;
            })
            .catch( reason => {
                this.log.error('poll(), error:', reason);
                this.eventEmitter.emit('cli', {
                    message: 'poll(), error' + reason
                });
                return;
            });
    }

    private async pollMessages(): Promise<any> {
        const response = await this.smsgService.smsgInbox('unread');
        // this.log.debug('got response:', response);
        return response;
    }

    private async parseJSONSafe(json: string): Promise<MarketplaceMessage|null> {
        let parsed = null;
        try {
            parsed = JSON.parse(json);
        } catch (e) {
            this.log.error('parseJSONSafe, invalid JSON:', json);
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
            default:
                throw new InternalServerException('Unknown action message.');
        }
    }
}
