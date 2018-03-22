import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';

import { EventEmitter } from '../../core/api/events';
import { SmsgMessage } from '../messages/SmsgMessage';

import { SmsgService } from '../services/SmsgService';
import { MarketService } from '../services/MarketService';
import { ListingItemService } from '../services/ListingItemService';
import { CoreRpcService } from '../services/CoreRpcService';

import { MessageProcessorInterface } from './MessageProcessorInterface';
import { MarketplaceMessageInterface } from '../messages/MarketplaceMessageInterface';
import { ListingItemMessageInterface } from '../messages/ListingItemMessageInterface';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { ListingItemReceivedListener } from '../listeners/ListingItemReceivedListener';

export class MessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private timeout: any;
    private interval = 3000;

    // tslint:disable:max-line-length
    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) private smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.MarketService) private marketService: MarketService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter
    ) {
        this.log = new Logger(__filename);
    }
    // tslint:enable:max-line-length

    public async process(messages: SmsgMessage[]): Promise<void> {
        this.log.debug('poll(), new messages:', JSON.stringify(messages, null, 2));

        for (const message of messages) {

            const marketModel = await this.marketService.findByAddress(message.to);
            const market = marketModel.toJSON();

            const parsed = await this.parseJSONSafe(message.text);
            if (parsed) {
                parsed.market = market.address;

                if (parsed.item) {
                    // ListingItemMessage
                    this.eventEmitter.emit('ListingItemReceivedEvent', parsed);
                    // this.eventEmitter.emit(ListingItemReceivedListener.Event, parsed);
                } else if (parsed.mpaction) {
                    // ActionMessage
                    // todo: different events for bids and escrows
                    // this.eventEmitter.emit('actions', {
                    //    action: parsed.mpaction,
                    //    market: market.address
                    // });

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
                /* this.eventEmitter.emit('cli', {
                    message: 'message from messageprocessor to the cli'
                }); */
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

    private async parseJSONSafe(json: string): Promise<MarketplaceMessageInterface|null> {
        let parsed = null;
        try {
            parsed = JSON.parse(json);
        } catch (e) {
            this.log.error('parseJSONSafe, invalid JSON:', json);
        }
        return parsed;
    }

    private async isPaidMessage(message: SmsgMessage): Promise<boolean> {
        return message.version === '0300';
    }
}
