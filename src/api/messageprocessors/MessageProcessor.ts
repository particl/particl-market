import * as rpc from 'particl-rpc-service';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { MarketplaceMessageInterface } from '../messages/MarketplaceMessageInterface';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';

export class MessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async poll(): Promise<void> {
        rpc.init();
    }

    public process(message: ActionMessageInterface): void {
        //
    }

}
