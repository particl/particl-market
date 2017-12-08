import * as rpc from 'particl-rpc-service';
import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { MarketplaceMessageInterface } from '../messages/MarketplaceMessageInterface';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';

export class MessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private timeout: any;
    private interval = 3000;

    private MAINNET_PORT = 51735;
    private TESTNET_PORT = 51935;
    private HOSTNAME = 'localhost';
    private USER = 'test';
    private PASSWORD = 'test';

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);

        rpc.init({
            rpcuser: this.USER,
            rpcpassword: this.PASSWORD,
            rpcbind: this.HOSTNAME,
            port: this.TESTNET_PORT
        });

        // this.schedulePoll();
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
        const response = await this.pollMessages().catch(reason => {
            this.log.info('error: ', reason);
        });
        this.log.info('response: ', response);
        return;
    }

    private async pollMessages(): Promise<any> {
        this.log.debug('timeout ', this.interval);

        return new Promise((resolve, reject) => {

            rpc.call('getnetworkinfo', null, (error, response) => {
                if (error) {
                    reject(error);
                } else if (response) {
                    resolve(response);
                }
            });

        });
    }

}
