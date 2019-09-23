// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { CoreRpcService, RpcWalletInfo } from './CoreRpcService';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { MessageException } from '../exceptions/MessageException';
import { CoreSmsgMessage } from '../messages/CoreSmsgMessage';
import { SmsgSendParams } from '../requests/action/SmsgSendParams';
import {SmsgMessageCreateRequest} from '../requests/model/SmsgMessageCreateRequest';
import * as resources from "resources";
import {ActionDirection} from '../enums/ActionDirection';
import * as _ from '@types/lodash';
import {KVS} from 'omp-lib/dist/interfaces/common';
import {ActionMessageObjects} from '../enums/ActionMessageObjects';
import {SmsgMessageCreateParams} from '../factories/model/ModelCreateParams';

export interface SmsgInboxOptions {
    updatestatus?: boolean;     // Update read status if true. default=true.
    encoding?: string;          // Display message data in encoding, values: "text", "hex", "none". default=text.
}

export interface CoreSmsgMessageResult {
    messages: CoreSmsgMessage[];
    result: string;             // amount
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
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * fetch new unread messages from particl-core and save them as SmsgMessages
     *
     */
    public async processNewCoreSmsgMessages(): Promise<void> {
        const options = {
            updatestatus: true
        } as SmsgInboxOptions;

        // fetch all unread messages and mark them read
        await this.smsgInbox('unread', '', options)
            .then( async messages => {
                if (messages.result !== '0') {
                    this.log.debug('found ' + messages.result + ' new unread smsgmessages');

                    // process CoreSmsgMessage in chunks of 10 at a time for SQLite insert
                    const messagesChunks: CoreSmsgMessage[][] = SmsgService.chunk(messages.messages, 10);

                    let processedAmount = 0;
                    for (const messagesChunk of messagesChunks) {
                        processedAmount = processedAmount + messagesChunk.length;
                        await this.process(messagesChunk);
                        this.log.debug('processed ' + processedAmount + '/' + messages.result + ' of new unread smsgmessages');
                    }

                } else {
                    this.log.debug('no new unread smsgmessages...');
                }
                return;
            })
            .catch( reason => {
                this.log.error('fetchNewCoreSmsgMessages(), error: ' + reason);
                return;
            });
    }

    /**
     * polls for new smsgmessages and stores them in the database
     *
     * @param {SmsgMessage[]} messages
     * @returns {Promise<void>}
     */
    public async process(messages: CoreSmsgMessage[]): Promise<void> {

        const smsgMessageCreateRequests: SmsgMessageCreateRequest[] = [];
        // this.log.debug('INCOMING messages.length: ', messages.length);

        // - fetch the CoreSmsgMessage from core
        // - create SmsgMessagesCreateRequests
        // - then save the CoreSmsgMessage to the db as SmsgMessages

        for (const message of messages) {
            // todo: this is an old problem and should be tested again if we could get rid of this now
            // get the message again using smsg, since the smsginbox doesnt return location && read (0.18.1.4)
            const msg: CoreSmsgMessage = await this.smsgService.smsg(message.msgid, false, true);

            // check whether an SmsgMessage with the msgid was already received and processed
            const existingSmsgMessage: resources.SmsgMessage = await this.smsgMessageService.findOneByMsgId(msg.msgid, ActionDirection.INCOMING)
                .then(value => value.toJSON())
                .catch(error => {
                    return undefined;
                });

            // in case of resent SmsgMessasge, check whether an SmsgMessage with the previously sent msgid was already received and processed
            const marketplaceMessage: MarketplaceMessage = JSON.parse(msg.text);
            const resentMsgIdKVS = _.find(marketplaceMessage.action.objects, (kvs: KVS) => {
                return kvs.key === ActionMessageObjects.RESENT_MSGID;
            });

            let existingResentSmsgMessage: resources.SmsgMessage | undefined;
            if (resentMsgIdKVS) {
                existingResentSmsgMessage = await this.smsgMessageService.findOneByMsgId(resentMsgIdKVS.value + '', ActionDirection.INCOMING)
                    .then(value => value.toJSON())
                    .catch(error => {
                        return undefined;
                    });
            } else {
                existingResentSmsgMessage = undefined;
            }

            if (existingSmsgMessage !== undefined || existingResentSmsgMessage !== undefined) {
                this.log.debug('SmsgMessage has already been received, skipping.');
            } else {
                const smsgMessageCreateRequest: SmsgMessageCreateRequest = await this.smsgMessageFactory.get({
                    direction: ActionDirection.INCOMING,
                    message: msg
                } as SmsgMessageCreateParams);
                smsgMessageCreateRequests.push(smsgMessageCreateRequest);
            }

        }

        // this.log.debug('process(), smsgMessageCreateRequests: ', JSON.stringify(smsgMessageCreateRequests, null, 2));

        // store all in db
        await this.smsgMessageService.createAll(smsgMessageCreateRequests)
            .then(async (idsProcessed) => {
                // after messages are stored, remove them
                for (const msgid of idsProcessed) {
                    await this.smsgService.smsg(msgid, true, true)
                        .then(value => this.log.debug('REMOVED: ', JSON.stringify(value, null, 2)))
                        .catch(reason => {
                            this.log.error('ERROR: ', reason);
                        });
                }
            })
            .catch(async (reason) => {
                this.log.error('ERROR: ', reason);
                if ((smsgMessageCreateRequests.length > 1) && (reason.errno === 19) && String(reason.code).includes('SQLITE_CONSTRAINT')) {
                    // Parse individual messages if the batch write failed due to a sqlite constrainst error,
                    // which results in the entire batched write failing
                    this.log.debug('process(): Parsing individual messages');
                    for (const smsgMessageCreateRequest of smsgMessageCreateRequests) {
                        await this.smsgMessageService.create(smsgMessageCreateRequest)
                            .then(async message => {
                                this.log.debug(`Created single message ${smsgMessageCreateRequest.msgid}`);
                                await this.smsgService.smsg(smsgMessageCreateRequest.msgid, true, true)
                                    .then(value => this.log.debug('REMOVED: ', JSON.stringify(value, null, 2)))
                                    .catch((reason2) => this.log.error('ERROR: ', reason2));
                            })
                            .catch(err => this.log.debug(`Failed processing single message ${smsgMessageCreateRequest.msgid}`));
                    }
                }
            });

        return;
    }

    /**
     *
     * @param marketplaceMessage
     * @param sendParams
     */
    public async canAffordToSendMessage(marketplaceMessage: MarketplaceMessage, sendParams: SmsgSendParams): Promise<boolean> {
        const estimate: SmsgSendResponse = await this.estimateFee(marketplaceMessage, sendParams);
        const wallet: RpcWalletInfo = await this.coreRpcService.getWalletInfo();
        return (wallet.balance > estimate.fee! || wallet.blind_balance > estimate.fee! || wallet.anon_balance > estimate.fee!);
    }

    /**
     *
     * @param marketplaceMessage
     * @param sendParams
     */
    public async estimateFee(marketplaceMessage: MarketplaceMessage, sendParams: SmsgSendParams): Promise<SmsgSendResponse> {
        const estimateFee = sendParams.estimateFee;
        sendParams.estimateFee = true; // forcing estimation just in case someone calls this directly with incorrect params
        const smsgSendResponse = await this.sendMessage(marketplaceMessage, sendParams);
        sendParams.estimateFee = estimateFee;
        return smsgSendResponse;
    }

    /**
     *
     * @param marketplaceMessage
     * @param sendParams
     */
    public async sendMessage(marketplaceMessage: MarketplaceMessage, sendParams: SmsgSendParams): Promise<SmsgSendResponse> {
        return await this.smsgSend(sendParams.fromAddress, sendParams.toAddress, marketplaceMessage, sendParams.paidMessage,
            sendParams.daysRetention, sendParams.estimateFee);
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
     * ﻿smsginbox [all|unread|clear] filter options
     *
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
        const response = await this.coreRpcService.call('smsginbox', [mode, filter, options], false);
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
     * @param {string} fromAddress
     * @param {string} toAddress
     * @param {MarketplaceMessage} message
     * @param {boolean} paidMessage
     * @param {number} daysRetention
     * @param {boolean} estimateFee
     * @returns {Promise<any>}
     */
    public async smsgSend(fromAddress: string,
                          toAddress: string,
                          message: MarketplaceMessage,
                          paidMessage: boolean = true,
                          daysRetention: number = parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10),
                          estimateFee: boolean = false): Promise<SmsgSendResponse> {

        this.log.debug('smsgSend, from: ' + fromAddress + ', to: ' + toAddress);
        const params: any[] = [
            fromAddress,
            toAddress,
            JSON.stringify(message),
            paidMessage,
            daysRetention,
            estimateFee
        ];
        const response: SmsgSendResponse = await this.coreRpcService.call('smsgsend', params);
        this.log.debug('smsgSend, response: ' + JSON.stringify(response, null, 2));
        if (response.error) {
            this.log.error('ERROR: ', JSON.stringify(response, null, 2));
            throw new MessageException('Failed to send message.');
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
        const response = await this.coreRpcService.call('smsglocalkeys');
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
     * @param {string} address
     * @param {string} publicKey
     * @returns {Promise<boolean>}
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
