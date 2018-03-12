import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { CoreRpcService } from '../services/CoreRpcService';
import { EventEmitter } from '../../core/api/events';
import { SmsgService } from '../services/SmsgService';
import { SmsgMessage } from '../messages/SmsgMessage';
import { MarketService } from '../services/MarketService';

export class MessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private timeout: any;
    private interval = 3000;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) private smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.MarketService) private marketService: MarketService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter
    ) {
        this.log = new Logger(__filename);
    }

    public async process(messages: SmsgMessage[]): Promise<void> {
        this.log.debug('poll(), new messages:', JSON.stringify(messages, null, 2));

        for (const message of messages) {

            if (await this.isMessageForKnownMarket(message)) {
                const parsed = this.parseJSONSafe(message.text);
                if (parsed) {
                    //
                }
            }
            // emit the latest message event to cli
            this.eventEmitter.emit('cli', {
                message
            });


        }

        /*
        {
          "messages": [
            {
              "msgid": "5ab6a55a00000000b03ef908a68357e38462045f4403cf219267a1ab",
              "version": "0300",
              "received": "2018-03-12T01:08:18+0200",
              "sent": "2018-03-12T01:06:02+0200",
              "from": "pgS7muLvK1DXsFMD56UySmqTryvnpnKvh6",
              "to": "pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA",
              "text": "hello"
            }
          ],
          "result": "1"
        }
         */
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

    private async parseJSONSafe(json: string): Promise<object|null> {
        let parsed = null;
        try {
            parsed = JSON.parse(json);
        } catch (e) {
            //
        }
        return parsed;
    }

    private async isMessageForKnownMarket(message: SmsgMessage): Promise<boolean> {
        const response = await this.marketService.findByAddress(message.to);
        this.log.debug('got response:', response);
        return response ? true : false;
    }

    private async isPaidMessage(message: SmsgMessage): Promise<boolean> {
        return message.version === '0300';
    }
}
