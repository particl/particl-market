import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { CoreRpcService } from './CoreRpcService';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';

export class SmsgService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * ﻿Adds a private key (as returned by dumpprivkey) to the smsg database.
     * The imported key can receive messages even if the wallet is locked.
     *
     * Arguments:
     * 1. "privkey"          (string, required) The private key (see dumpprivkey)
     * 2. "label"            (string, optional, default="") An optional label
     *
     * @param {string} privateKey
     * @param {string} label
     * @returns {Promise<boolean>}
     */
    public async smsgImportPrivKey(privateKey: string, label: string = 'default market'): Promise<boolean> {
        return await this.coreRpcService.call('smsgimportprivkey', [privateKey, label])
            .then(response => true)
            .catch(error => {
                this.log.error('smsgImportPrivKey failed: ', error);
                return false;
            });
    }

    /**
     * Decrypt and display all received messages.
     * Warning: clear will delete all messages.
     *
     * ﻿smsginbox [all|unread|clear]
     *
     * @param {string} param
     * @returns {Promise<any>}
     */
    public async smsgInbox(param: string = 'all'): Promise<any> {
        const response = await this.coreRpcService.call('smsginbox', [param], false);
        // this.log.debug('got response:', response);
        return response;
    }

    /**
     * ﻿Send an encrypted message from address to another
     *
     * response:
     * {
     * "result": "Sent.",
     * "txid": "756be1d7b7ebcac344792bd2f050b75240ec7bc0c47d706adde8f87bec260c22",
     * "fee": 0.002554
     * }
     * {
     * "result": "Send failed.",
     * "error": "Message is too long, 5392 > 4096"
     * }
     *
     * @param {string} profileAddress
     * @param {string} marketAddress
     * @param {MarketplaceMessage} message
     * @param {boolean} paidMessage
     * @param {number} daysRetention
     * @returns {Promise<any>}
     */
    public async smsgSend(profileAddress: string, marketAddress: string, message: MarketplaceMessage,
                          paidMessage: boolean = true,
                          daysRetention: number = parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10)): Promise<SmsgSendResponse> {

        this.log.debug('smsgSend, from: ' + profileAddress + ', to: ' + marketAddress);
        // this.log.debug('smsgSend, message: ' + JSON.stringify(message, null, 2));
        // const messageStr = JSON.stringify(message);
        // this.log.debug('smsgSend, messageStr: ' + JSON.stringify(message));
        const params: any[] = [profileAddress, marketAddress, JSON.stringify(message), paidMessage, daysRetention];
        const response: SmsgSendResponse = await this.coreRpcService.call('smsgsend', params);

        this.log.debug('smsgSend, response: ' + JSON.stringify(response, null, 2));
        return response;
    }

    /**
     * List and manage keys.
     * ﻿﻿[whitelist|all|wallet|recv <+/-> <address>|anon <+/-> <address>]
     *
     * response:
     * ﻿{
     * "wallet_keys": [
     * ],
     * "smsg_keys": [
     *   {
     *     "address": "pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA",
     *     "public_key": "MkRjwngPvzX17eF6sjadwjgfjHmn3E9wVheSTi1UjecUNxxZtBFyVJLiWCrMUrm4FbpFW3ehg5HaWfxFd3xQnRzj",
     *     "receive": "1",
     *     "anon": "1",
     *     "label": "default market"
     *   }
     * ],
     * "result": "1"
     * }
     *
     * @returns {Promise<any>}
     */
    public async smsgLocalKeys(): Promise<any> {
        const response = await this.coreRpcService.call('smsglocalkeys');
        this.log.debug('smsgLocalKeys, response: ' + JSON.stringify(response, null, 2));
        return response;
    }

    /**
     * ﻿Add address and matching public key to database.
     * ﻿smsgaddaddress <address> <pubkey>
     *
     * @param {string} address
     * @param {string} publicKey
     * @returns {Promise<any>}
     */
    public async smsgAddAddress(address: string, publicKey: string): Promise<boolean> {
        return await this.coreRpcService.call('smsgaddaddress', [address, publicKey])
            .then(response => {
                this.log.debug('smsgAddAddress, response: ' + JSON.stringify(response, null, 2));
                if (response.result === 'Public key added to db.'
                    || (response.result === 'Public key not added to db.' && response.reason === 'Public key exists in database')) {
                    return true;
                } else {
                    return false;
                }
            })
            .catch(error => {
                this.log.error('smsgAddAddress failed: ', error);
                return false;
            });
    }
}
