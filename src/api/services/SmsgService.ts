// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { CoreRpcService } from './CoreRpcService';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { MessageException } from '../exceptions/MessageException';
import { CoreSmsgMessage } from '../messages/CoreSmsgMessage';
import { SmsgSendParams } from '../requests/action/SmsgSendParams';
import { SmsgMessageService } from './model/SmsgMessageService';
import { RpcWallet, RpcWalletInfo } from 'omp-lib/dist/interfaces/rpc';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import {CoreMessageVersion} from '../enums/CoreMessageVersion';
import {MessageVersions} from '../messages/MessageVersions';

export interface SmsgGetInfo {
    enabled: boolean;
    active_wallet: string;
    enabled_wallets: string[];
}

export interface SmsgGetPubKey {
    address: string;            // (string) address of public key
    publickey: string;          // (string) public key of address
}

export interface SmsgInboxOptions {
    updatestatus?: boolean;     // Update read status if true. default=true.
    encoding?: string;          // Display message data in encoding, values: "text", "hex", "none". default=text.
}

export interface CoreSmsgMessageResult {
    messages: CoreSmsgMessage[];
    result: string;             // amount
}

export interface SmsgZmqPushOptions {
    timefrom: number;           // Skip messages received before timestamp. (core default=0)
    timeto: number;             // Skip messages received after timestamp. (core default=max_int)
    unreadonly: boolean;        // Resend only unread messages. (core default=true)
}

export interface SmsgZmqPushResult {
    numsent: number;            // Number of notifications sent
}

/**
 * {
 *      "fromfile": bool,          (boolean, optional, default=false) Send file as message, path specified in "message".
 *      "decodehex": bool,         (boolean, optional, default=false) Decode "message" from hex before sending.
 *      "submitmsg": bool,         (boolean, optional, default=true) Submit smsg to network, if false POW is not set and hex encoded smsg returned.
 *      "savemsg": bool,           (boolean, optional, default=true) Save smsg to outbox.
 *      "ttl_is_seconds": bool,    (boolean, optional, default=false) If true days_retention parameter is interpreted as seconds to live.
 *      "fund_from_rct": bool,     (boolean, optional, default=false) Fund message from anon balance.
 *      "rct_ring_size": n,        (numeric, optional, default=5) Ring size to use with fund_from_rct.
 * }
 */
export interface SmsgSendOptions {
    fromfile: boolean;          // (boolean, optional, default=false) Send file as message, path specified in "message".
    decodehex: boolean;         // (boolean, optional, default=false) Decode "message" from hex before sending.
    submitmsg: boolean;         // (boolean, optional, default=true) Submit smsg to network, if false POW is not set and hex encoded smsg returned.
    savemsg: boolean;           // (boolean, optional, default=true) Save smsg to outbox.
    ttl_is_seconds: boolean;    // (boolean, optional, default=false) If true days_retention parameter is interpreted as seconds to live.
    fund_from_rct: boolean;     // (boolean, optional, default=false) Fund message from anon balance.
    rct_ring_size: number;      // (numeric, optional, default=5) Ring size to use with fund_from_rct.
}

export interface SmsgSendCoinControl {
    changeaddress: string;      // (string, optional, default=) The particl address to receive the change
    inputs: any[];              // TODO: {                        (json object, optional, default=)
                                //     "tx": "hex",           (string, required) txn id
                                //     "n": n,                (numeric, required) txn vout
                                // }
    replaceable: boolean;       // (boolean, optional, default=) Marks this transaction as BIP125 replaceable.
    conf_target: number;        // (numeric, optional, default=) Confirmation target (in blocks)
    estimate_mode: string;      // (string, optional, default=UNSET) The fee estimate mode, must be one of: "UNSET", "ECONOMICAL", "CONSERVATIVE"
    avoid_reuse: boolean;       // (boolean, optional, default=true) (only available if avoid_reuse wallet flag is set) Avoid spending from dirty addresses;
                                // addresses are considered dirty if they have previously been used in a transaction.
    feeRate: number;            // (numeric, optional) Set a specific fee rate in PART/kB
}

export class SmsgService {

    private static chunk<T>(arrayToChunk: T[], chunkSize: number): T[][] {
        return arrayToChunk.reduce((previousValue: any, currentValue: any, currentIndex: number, array: T[]) =>
            !(currentIndex % chunkSize)
                ? previousValue.concat([array.slice(currentIndex, currentIndex + chunkSize)])
                : previousValue, []);
    }

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * request new unread messages to be sent through zmq
     *
     * @param from, messages received before timestamp
     * @param to, messages received after timestamp
     */
    public async pushUnreadCoreSmsgMessages(from?: number, to?: number): Promise<SmsgZmqPushResult> {
        if (!from) {
            const lastSmsgMessage: resources.SmsgMessage = await this.smsgMessageService.findLast()
                .then(value => {
                    return value.toJSON();
                })
                .catch(reason => {
                    this.log.info('No new smsg messages waiting to be processed.');
                    return undefined;
                });

            this.log.debug('pushUnreadCoreSmsgMessages(), lastSmsgMessage: ', JSON.stringify(lastSmsgMessage, null, 2));
            if (_.isEmpty(lastSmsgMessage)) {
                const earliestDate = 60 * 60 * 24 * parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10);
                from = Math.trunc(Date.now() / 1000) - earliestDate;
            } else {
                from = Math.trunc(lastSmsgMessage.received / 1000);
            }
        }

        if (!to) {
            to = Math.trunc(Date.now() / 1000);
        }

        const pushOptions: SmsgZmqPushOptions = {
            timefrom: from,             // timefrom, the last SmsgMessage received time
            timeto: to,                 // timeto, now
            unreadonly: true
        };
        this.log.debug('pushUnreadCoreSmsgMessages(), pushOptions: ', JSON.stringify(pushOptions, null, 2));

        const result: SmsgZmqPushResult = await this.smsgZmqPush(pushOptions);

        this.log.debug('requestUnreadCoreSmsgMessagesSinceShutdown(), numsent:', result.numsent);
        return result;
    }

    /**
     *
     * @param marketplaceMessage
     * @param sendParams
     */
    public async canAffordToSendMessage(marketplaceMessage: MarketplaceMessage, sendParams: SmsgSendParams): Promise<boolean> {
        const estimate: SmsgSendResponse = await this.estimateFee(marketplaceMessage, sendParams);
        const walletInfo: RpcWalletInfo = await this.coreRpcService.getWalletInfo(sendParams.wallet);

        if (sendParams.anonFee) {
            return walletInfo.anon_balance > estimate.fee!;
        } else {
            return walletInfo.balance > estimate.fee!;
        }
    }

    /**
     *
     * @param marketplaceMessage
     * @param sendParams
     */
    public async estimateFee(marketplaceMessage: MarketplaceMessage, sendParams: SmsgSendParams): Promise<SmsgSendResponse> {
        const estimateFee = sendParams.estimateFee;
        sendParams.estimateFee = true; // forcing estimation just in case someone calls this directly with incorrect params
        const smsgSendResponse: SmsgSendResponse = await this.sendMessage(marketplaceMessage, sendParams);
        sendParams.estimateFee = estimateFee;
        return smsgSendResponse;
    }

    /**
     *
     * @param marketplaceMessage
     * @param sendParams
     */
    public async sendMessage(marketplaceMessage: MarketplaceMessage, sendParams: SmsgSendParams): Promise<SmsgSendResponse> {

        // messageVersion can be overriden with sendParams.messageType
        const messageVersion = sendParams.messageType ? sendParams.messageType : MessageVersions.get(marketplaceMessage.action.type);
        const paidMessage = messageVersion === CoreMessageVersion.PAID;

        // todo: switch to use ttl_is_seconds
        // todo: savemsg false?
        const options = {
            fromfile: false,            // (boolean, optional, default=false) Send file as message, path specified in "message".
            decodehex: false,           // (boolean, optional, default=false) Decode "message" from hex before sending.
            submitmsg: true,            // (boolean, optional, default=true) Submit smsg to network, if false POW is not set and hex encoded smsg returned.'
            savemsg: true,              // (boolean, optional, default=true) Save smsg to outbox.
            ttl_is_seconds: false,      // (boolean, optional, default=false) If true days_retention parameter is interpreted as seconds to live.
            fund_from_rct: sendParams.anonFee ? sendParams.anonFee : false, // (boolean, optional, default=false) Fund message from anon balance.
            rct_ring_size: sendParams.ringSize ? sendParams.ringSize : 12   // (numeric, optional, default=5) Ring size to use with fund_from_rct.
        } as SmsgSendOptions;

        return await this.smsgSend(sendParams.wallet, sendParams.fromAddress, sendParams.toAddress, marketplaceMessage, paidMessage,
            sendParams.daysRetention, sendParams.estimateFee, options);
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
    public async smsgImportPrivKey(privateKey: string, label: string = 'particl-market imported pk'): Promise<boolean> {
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
     * ﻿smsginbox [all|unread|clear] filter options
     *
     * @param wallet
     * @param {string} mode
     * @param {string} filter
     * @param {object} options
     * @returns {Promise<any>}
     */
    public async smsgInbox(mode: string = 'all',
                           filter: string = '',
                           options?: SmsgInboxOptions): Promise<CoreSmsgMessageResult> {
        if (!options) {
            options = {
                updatestatus: true,
                encoding: 'text'
            } as SmsgInboxOptions;
        }
        const response = await this.coreRpcService.call('smsginbox', [mode, filter, options], undefined, false);
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
     * https://github.com/tecnovert/particl-core/blob/f66e893f276e68fa8ece0054b443db61bbc9b5e7/src/smsg/smessage.cpp#L95
     * uint32_t SMSG_MAX_FREE_TTL      = SMSG_SECONDS_IN_DAY * 14;
     * uint32_t SMSG_MAX_PAID_TTL      = SMSG_SECONDS_IN_DAY * 31;
     * uint32_t SMSG_RETENTION         = SMSG_MAX_PAID_TTL;
     *
     * @param wallet
     * @param {string} fromAddress
     * @param {string} toAddress
     * @param {MarketplaceMessage} message
     * @param {boolean} paidMessage
     * @param {number} daysRetention
     * @param {boolean} estimateFee
     * @param options
     * @param coinControl
     * @returns {Promise<any>}
     */
    public async smsgSend(wallet: string, fromAddress: string, toAddress: string, message: MarketplaceMessage, paidMessage: boolean = true,
                          daysRetention: number = parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10),
                          estimateFee: boolean = false, options?: SmsgSendOptions, coinControl?: SmsgSendCoinControl): Promise<SmsgSendResponse> {

        // set secure messaging to use the specified wallet
        await this.smsgSetWallet(wallet);

        // enable receiving messages on the sending address, just in case
        await this.smsgAddLocalAddress(fromAddress);

        this.log.debug('smsgSend, from: ' + fromAddress + ', to: ' + toAddress + ', daysRetention: ' + daysRetention + ', estimateFee: ' + estimateFee);
        const params: any[] = [
            fromAddress,
            toAddress,
            JSON.stringify(message),
            paidMessage,
            daysRetention,
            estimateFee,
            options
            // coinControl
        ];
        const response: SmsgSendResponse = await this.coreRpcService.call('smsgsend', params, wallet);
        this.log.debug('smsgSend, response: ' + JSON.stringify(response, null, 2));
        if (response.error) {
            this.log.error('ERROR: ', JSON.stringify(response, null, 2));
            throw new MessageException(`Failed to send message: ${response.error}`);
        }
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
        const response = await this.coreRpcService.call('smsglocalkeys', []);
        // this.log.debug('smsgLocalKeys, response: ' + JSON.stringify(response, null, 2));
        return response;
    }


    /**
     * View smsg by msgid.
     *
     * Arguments:
     * 1. "msgid"              (string, required) The id of the message to view.
     * 2. options              (json, optional) Options object.
     * {
     *       "delete": bool                 (bool, optional) Delete msg if true.
     *       "setread": bool                (bool, optional) Set read status to value.
     *       "encoding": str                (string, optional, default="ascii") Display message data in encoding, values: "hex".
     * }
     *
     * Result:
     * {
     *  "msgid": "..."                    (string) The message identifier
     *  "version": "str"                  (string) The message version
     *  "location": "str"                 (string) inbox|outbox|sending
     *  "received": int                     (int) Time the message was received
     *  "to": "str"                       (string) Address the message was sent to
     *  "read": bool                        (bool) Read status
     *  "sent": int                         (int) Time the message was created
     *  "paid": bool                        (bool) Paid or free message
     *  "daysretention": int                (int) Number of days message will stay in the network for
     *  "expiration": int                   (int) Time the message will be dropped from the network
     *  "payloadsize": int                  (int) Size of user message
     *  "from": "str"                     (string) Address the message was sent from
     * }
     *
     * @returns {Promise<CoreSmsgMessage>}
     */
    public async smsg(msgId: string, remove: boolean = false, setRead: boolean = true): Promise<CoreSmsgMessage> {
        const response = await this.coreRpcService.call('smsg', [msgId, {
                delete: remove,
                setread: setRead,
                encoding: 'text'
            }
        ]);
        // this.log.debug('smsg, response: ' + JSON.stringify(response, null, 2));
        return response;
    }

    /**
     * ﻿Add address and matching public key to database.
     * ﻿smsgaddaddress <address> <pubkey>
     *
     * 1. address    (string, required) Address to add.
     * 2. pubkey     (string, required) Public key for "address".
     *
     * @param {string} address
     * @param {string} publicKey
     * @returns {Promise<boolean>}
     */
    public async smsgAddAddress(address: string, publicKey: string): Promise<boolean> {
        return await this.coreRpcService.call('smsgaddaddress', [address, publicKey])
            .then(response => {
                // this.log.debug('smsgAddAddress, response: ' + JSON.stringify(response, null, 2));
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


    /**
     * Enable receiving messages on address.
     * Key for address must exist in the wallet.
     *
     * @param {string} address
     * @returns {Promise<boolean>}
     */
    public async smsgAddLocalAddress(address: string): Promise<boolean> {
        return await this.coreRpcService.call('smsgaddlocaladdress', [address])
            .then(response => {
                this.log.debug('smsgAddLocalAddress, response: ' + JSON.stringify(response, null, 2));
                if (response.result === 'Receiving messages enabled for address.'
                    || (response.result === 'Address not added.' && response.reason === 'Key exists in database')) {
                    return true;
                } else {
                    return false;
                }
            })
            .catch(error => {
                this.log.error('smsgAddLocalAddress failed: ', error);
                return false;
            });
    }


    /**
     * ﻿Returns a new Particl address for receiving smsg and payments, key is saved in wallet.
     *
     * Result:
     * "address"                (string) The new particl address
     *
     * @param wallet
     * @param {any[]} params
     * @param {boolean} smsgAddress
     * @returns {Promise<string>}
     */
    public async getNewAddress(wallet: string, params: any[] = [], smsgAddress: boolean = true): Promise<string> {
        const address = await this.coreRpcService.getNewAddress(wallet, params);
        const publicKey = await this.smsgGetPubKey(address);    // get address public key
        await this.smsgAddAddress(address, publicKey);          // add address and matching public key to smsg database
        await this.smsgAddLocalAddress(address);                // enable receiving messages on address.
        return address;
    }

    /**
     * Reveals the private key corresponding to 'address'.
     *
     * @param address    (string, required) The particl address for the private key
     */
    public async smsgGetPubKey(address: string): Promise<string> {
        const result: SmsgGetPubKey = await this.coreRpcService.call('smsggetpubkey', [address]);
        return result.publickey;
    }


    public async getPublicKeyForAddress(address: string): Promise<string|undefined> {
        return await this.smsgLocalKeys()
            .then(localKeys => {
                for (const smsgKey of localKeys.smsg_keys) {
                    if (smsgKey.address === address) {
                        return smsgKey.public_key;
                    }
                }
                return undefined;
            })
            .catch(error => undefined);
    }


    /**
     *
     * @param address
     */
    public async smsgDumpPrivKey(address: string): Promise<string> {
        return await this.coreRpcService.call('smsgdumpprivkey', [address]);
    }


    /**
     * Set secure messaging to use the specified wallet.
     * SMSG can only be enabled on one wallet.
     * Call with no parameters to unset the active wallet.
     *
     * @param walletName
     */
    public async smsgSetWallet(walletName: string): Promise<RpcWallet> {
        const result: RpcWallet = await this.coreRpcService.call('smsgsetwallet', [walletName]);
        // this.log.debug('smsgSetWallet(), result: ', JSON.stringify(result, null, 2));
        return result;
    }


    /**
     * USE smsgSetWallet!
     */
    public async smsgEnable(walletName: string): Promise<void> {
        throw new NotImplementedException();
    }

    /**
     *
     */
    public async smsgGetInfo(): Promise<SmsgGetInfo> {
        const result: SmsgGetInfo = await this.coreRpcService.call('smsggetinfo', []);
        // this.log.debug('smsgGetInfo(), result: ', JSON.stringify(result, null, 2));
        return result;
    }


    /**
     * ﻿Resend ZMQ notifications.
     * smsgzmqpush <options>
     *
     * @param options
     * @returns {Promise<SmsgZmqPushResult>}
     */
    public async smsgZmqPush(options: SmsgZmqPushOptions): Promise<SmsgZmqPushResult> {
        return await this.coreRpcService.call('smsgzmqpush', [options])
            .then(response => {
                this.log.debug('smsgZmqPush, response: ' + JSON.stringify(response, null, 2));
                return response;
            });
    }

}
