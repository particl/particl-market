import { Logger as LoggerType } from '../../core/Logger';
import { CoreRpcService } from './CoreRpcService';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
export declare class SmsgService {
    coreRpcService: CoreRpcService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(coreRpcService: CoreRpcService, Logger: typeof LoggerType);
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
    smsgImportPrivKey(privateKey: string, label?: string): Promise<boolean>;
    /**
     * Decrypt and display all received messages.
     * Warning: clear will delete all messages.
     *
     * ﻿smsginbox [all|unread|clear]
     *
     * @param {string} param
     * @returns {Promise<any>}
     */
    smsgInbox(param?: string): Promise<any>;
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
    smsgSend(profileAddress: string, marketAddress: string, message: MarketplaceMessage, paidMessage?: boolean, daysRetention?: number): Promise<SmsgSendResponse>;
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
    smsgLocalKeys(): Promise<any>;
    /**
     * ﻿Add address and matching public key to database.
     * ﻿smsgaddaddress <address> <pubkey>
     *
     * @param {string} address
     * @param {string} publicKey
     * @returns {Promise<any>}
     */
    smsgAddAddress(address: string, publicKey: string): Promise<boolean>;
}
