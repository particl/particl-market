import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { ItemMessageInterface } from '../messages/ItemMessageInterface';

import { CoreRpcService } from './CoreRpcService';

export class SmsgService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }


    public async smsgImportPrivKey( privateKey: string, label: string = 'default market' ): Promise<boolean> {
        return await this.coreRpcService.call('smsgimportprivkey', [privateKey, label]);
    }

    public async smsgInbox(params: any[] = []): Promise<any> {
        const response = await this.coreRpcService.call('smsginbox', params);
        // this.log.debug('got response:', response);
        return response;
    }

    /**
     * ﻿Send an encrypted message from address to another
     *
     * @param {string} profileAddress
     * @param {string} marketAddress
     * @param {ActionMessageInterface | ItemMessageInterface} message
     * @returns {Promise<any>}
     */
    public async smsgSend(profileAddress: string, marketAddress: string, message: ActionMessageInterface | ItemMessageInterface): Promise<any> {
        this.log.debug('smsgSend, from: ' + profileAddress + ', to: ' + marketAddress);
        this.log.debug('smsgSend, message: ' + JSON.stringify(message, null, 2));
        const response = await this.coreRpcService.call('smsgsend', [profileAddress, marketAddress, JSON.stringify(message)]);
        this.log.debug('smsgSend, response: ' + JSON.stringify(response, null, 2));
        return response;
    }

    /**
     * List and manage keys.
     * ﻿﻿[whitelist|all|wallet|recv <+/-> <address>|anon <+/-> <address>]
     *
     * @returns {Promise<any>}
     */
    public async smsgLocalKeys(): Promise<any> {
        const response = await this.coreRpcService.call('﻿smsglocalkeys');
        this.log.debug('smsgLocalKeys, response: ' + JSON.stringify(response, null, 2));
        return response;
    }

    /**
     *
     * @param {string} profileAddress
     * @param {string} marketAddress
     * @param {ActionMessageInterface | ItemMessageInterface} message
     * @returns {Promise<void>}
     */
    public async broadcast(profileAddress: string, marketAddress: string, message: ActionMessageInterface | ItemMessageInterface): Promise<any> {
        return this.smsgSend(profileAddress, marketAddress, message);
    }
}
