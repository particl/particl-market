import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { CliIo } from '../../core/CliIo';
import { Types, Core, Targets } from '../../constants';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { CoreRpcService } from '../services/CoreRpcService';

export class MessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private timeout: any;
    private interval = 3000;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Core) @named(Core.CliIo) public cliIo: CliIo
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
                this.schedulePoll();
            },
            this.interval
        );
    }

    /**
     * main poll
     *
     * @returns {Promise<void>}
     */
    private async poll(): Promise<void> {
        this.cliIo.emit('message', 'ping2');
        this.cliIo.getIo().emit('message', 'ping3');
        // console.log('2: ' + this.cliIo.tmp);
        // console.log('3: ' + this.cliIo.getIo());
        await this.pollMessages()
            .then( messages => {
                // this.log.debug('poll() response:', messages);
                // TODO: if we have new message, pass those to processing

                return;
            })
            .catch( reason => {
                this.log.error('poll() error:', reason);
                return;
            });
    }

    private async pollMessages(): Promise<any> {
        const response = await this.coreRpcService.call('smsginbox', ['all']);
        // this.log.debug('got response:', response);
        return response;
    }
}
