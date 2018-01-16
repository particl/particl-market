import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { ItemMessageInterface } from '../messages/ItemMessageInterface';

export class MessageBroadcastService {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async broadcast(message: ActionMessageInterface | ItemMessageInterface): Promise<void> {
        // TODO: to be implemented
        return;
    }
}
