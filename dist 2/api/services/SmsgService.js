"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const CoreRpcService_1 = require("./CoreRpcService");
let SmsgService = class SmsgService {
    constructor(coreRpcService, Logger) {
        this.coreRpcService = coreRpcService;
        this.Logger = Logger;
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
    smsgImportPrivKey(privateKey, label = 'default market') {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.coreRpcService.call('smsgimportprivkey', [privateKey, label])
                .then(response => true)
                .catch(error => {
                this.log.error('smsgImportPrivKey failed: ', error);
                return false;
            });
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
    smsgInbox(param = 'all') {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const response = yield this.coreRpcService.call('smsginbox', [param], false);
            // this.log.debug('got response:', response);
            return response;
        });
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
    smsgSend(fromAddress, toAddress, message, paidMessage = true, daysRetention = parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10), estimateFee = false) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('smsgSend, from: ' + fromAddress + ', to: ' + toAddress);
            const params = [
                fromAddress,
                toAddress,
                JSON.stringify(message),
                paidMessage,
                daysRetention,
                estimateFee
            ];
            const response = yield this.coreRpcService.call('smsgsend', params);
            this.log.debug('smsgSend, response: ' + JSON.stringify(response, null, 2));
            return response;
        });
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
    smsgLocalKeys() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const response = yield this.coreRpcService.call('smsglocalkeys');
            // this.log.debug('smsgLocalKeys, response: ' + JSON.stringify(response, null, 2));
            return response;
        });
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
     * @returns {Promise<IncomingSmsgMessage>}
     */
    smsg(msgId, remove = false, setRead = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const response = yield this.coreRpcService.call('smsg', [msgId, {
                    delete: remove,
                    setread: setRead,
                    encoding: 'ascii'
                }
            ]);
            // this.log.debug('smsg, response: ' + JSON.stringify(response, null, 2));
            return response;
        });
    }
    /**
     * ﻿Add address and matching public key to database.
     * ﻿smsgaddaddress <address> <pubkey>
     *
     * @param {string} address
     * @param {string} publicKey
     * @returns {Promise<boolean>}
     */
    smsgAddAddress(address, publicKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.coreRpcService.call('smsgaddaddress', [address, publicKey])
                .then(response => {
                this.log.debug('smsgAddAddress, response: ' + JSON.stringify(response, null, 2));
                if (response.result === 'Public key added to db.'
                    || (response.result === 'Public key not added to db.' && response.reason === 'Public key exists in database')) {
                    return true;
                }
                else {
                    return false;
                }
            })
                .catch(error => {
                this.log.error('smsgAddAddress failed: ', error);
                return false;
            });
        });
    }
};
SmsgService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.CoreRpcService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [CoreRpcService_1.CoreRpcService, Object])
], SmsgService);
exports.SmsgService = SmsgService;
//# sourceMappingURL=SmsgService.js.map