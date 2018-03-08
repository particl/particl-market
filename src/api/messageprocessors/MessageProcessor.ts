import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { CoreRpcService } from '../services/CoreRpcService';
import { EventEmitter } from '../../core/api/events';

export class MessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private timeout: any;
    private interval = 3000;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter
    ) {
        this.log = new Logger(__filename);
    }

    public process(message: ActionMessageInterface): void {
        //
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
            .then( messages => {
                this.log.debug('poll() response:', messages);
                // TODO: if we have new message, pass those to processing

                return;
            })
            .catch( reason => {
                this.log.error('poll() error:', reason);
                this.eventEmitter.emit('cli', {
                    message: 'poll() error' + reason
                });
                return;
            });
    }

    private async pollMessages(): Promise<any> {
        const response = await this.coreRpcService.smsgInbox( ['all']);
        // this.log.debug('got response:', response);
        return response;
    }
}
