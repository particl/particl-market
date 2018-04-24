"use strict";
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
     * @param {string} profileAddress
     * @param {string} marketAddress
     * @param {MarketplaceMessage} message
     * @param {boolean} paidMessage
     * @param {number} daysRetention
     * @returns {Promise<any>}
     */
    smsgSend(profileAddress, marketAddress, message, paidMessage = true, daysRetention = parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10)) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // TODO: REMOVE!
            // if (Environment.isDevelopment() || Environment.isTest()) {
            //    paidMessage = false;
            // }
            this.log.debug('smsgSend, from: ' + profileAddress + ', to: ' + marketAddress);
            // this.log.debug('smsgSend, message: ' + JSON.stringify(message, null, 2));
            // const messageStr = JSON.stringify(message);
            // this.log.debug('smsgSend, messageStr: ' + JSON.stringify(message));
            const params = [profileAddress, marketAddress, JSON.stringify(message), paidMessage, daysRetention];
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
     * ﻿Add address and matching public key to database.
     * ﻿smsgaddaddress <address> <pubkey>
     *
     * @param {string} address
     * @param {string} publicKey
     * @returns {Promise<any>}
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