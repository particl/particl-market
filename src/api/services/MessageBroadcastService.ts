import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { ItemMessageInterface } from '../messages/ItemMessageInterface';

import { CoreRpcService } from './CoreRpcService';

export class MessageBroadcastService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param {string} profileAddress
     * @param {string} marketAddress
     * @param {ActionMessageInterface | ItemMessageInterface} message
     * @returns {Promise<void>}
     */
    public async broadcast(profileAddress: string, marketAddress: string, message: ActionMessageInterface | ItemMessageInterface): Promise<void> {

        this.coreRpcService.sendSmsgMessage(profileAddress, marketAddress, message);
        return Promise.resolve();
    }
}
