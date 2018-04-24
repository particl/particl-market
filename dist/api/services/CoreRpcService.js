"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Environment_1 = require("../../core/helpers/Environment");
const WebRequest = require("web-request");
const HttpException_1 = require("../exceptions/HttpException");
const InternalServerException_1 = require("../exceptions/InternalServerException");
const CoreCookieService_1 = require("./CoreCookieService");
let RPC_REQUEST_ID = 1;
let CoreRpcService = class CoreRpcService {
    // DEFAULT_USERNAME & DEFAULT_PASSWORD in CoreCookieService
    constructor(Logger, coreCookieService) {
        this.Logger = Logger;
        this.coreCookieService = coreCookieService;
        this.DEFAULT_MAINNET_PORT = 51735;
        this.DEFAULT_TESTNET_PORT = 51935;
        this.DEFAULT_HOSTNAME = 'localhost';
        this.log = new Logger(__filename);
    }
    isConnected() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.getNetworkInfo()
                .then(response => true)
                .catch(error => {
                return false;
            });
        });
    }
    getNetworkInfo() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.call('getnetworkinfo', [], false);
        });
    }
    /**
     * ﻿Returns a new Particl address for receiving payments, key is saved in wallet.
     *
     * If 'account' is specified (DEPRECATED), it is added to the address book
     * so payments received with the address will be credited to 'account'.
     *
     * params:
     * ﻿[0] "account", (string, optional) DEPRECATED. The account name for the address to be linked to. If not provided,
     *      the default account "" is used. It can also be set to the empty string "" to represent the default account.
     *      The account does not need to exist, it will be created if there is no account by the given name.
     * [1] bech32, (bool, optional) Use Bech32 encoding.
     * [2] hardened, (bool, optional) Derive a hardened key.
     * [3] 256bit, (bool, optional) Use 256bit hash.
     *
     * @param {any[]} params
     * @param {boolean} smsgAddress
     * @returns {Promise<any>}
     */
    getNewAddress(params = [], smsgAddress = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const response = yield this.call('getnewaddress', params);
            if (smsgAddress) {
                // call﻿smsgaddlocaladdress, even though I'm not sure if its required
                const addLocalAddressResponse = yield this.call('smsgaddlocaladdress', [response]);
                this.log.debug('addLocalAddressResponse: ', addLocalAddressResponse);
                // add address as receive address
                // const localKeyResponse = await this.call('smsglocalkeys', ['recv', '+', response]);
                // this.log.debug('localKeyResponse: ', localKeyResponse);
            }
            return response;
        });
    }
    /**
     * ﻿﻿Return information about the given particl address. Some information requires the address to be in the wallet.
     *
     * example result:
     * {
     *   "address": "pdtVbU4WBLCvM3gwfBFbDtkG79qUnF62xV",
     *   "scriptPubKey": "76a91462c87f85096decc977f6abe76a6824d2dcd11b9a88ac",
     *   "from_ext_address_id": "xBc887dWRvSSwTkNbsfrVrms23YVXD2NZc",
     *   "path": "m/0/6817",
     *   "ismine": true,
     *   "iswatchonly": false,
     *   "isscript": false,
     *   "iswitness": false,
     *   "pubkey": "02570e92f4b8fb95599bd22a2428286bffad59d2de62ddf42d276653806a61e7f9",
     *   "iscompressed": true,
     *   "account": "_escrow_pub_0b787bf9b0da334baf91b62213f0f0362858299d3babd96893fd010414b71c43"
     * }
     *
     * @param {string} address
     * @returns {Promise<any>}
     */
    getAddressInfo(address) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.call('getaddressinfo', [address]);
        });
    }
    /**
     * ﻿Add a nrequired-to-sign multisignature address to the wallet. Requires a new wallet backup.
     *
     * Each key is a Particl address or hex-encoded public key.
     * If 'account' is specified (DEPRECATED), assign address to that account.
     *
     * params:
     * ﻿[0] ﻿nrequired,       (numeric, required) The number of required signatures out of the n keys or addresses.
     * [1] "keys",          (string, required) A json array of particl addresses or hex-encoded public keys
     *      [
     *          "address"   (string) particl address or hex-encoded public key
     *          ...,
     *      ]
     * [2] "account"        (string, optional) DEPRECATED. An account to assign the addresses to.
     * [3] bech32           (bool, optional) Use Bech32 encoding.
     * [4] 256bit           (bool, optional) Use 256bit hash.
     *
     * example result:
     * ﻿{
     *   "address":"multisigaddress",    (string) The value of the new multisig address.
     *   "redeemScript":"script"         (string) The string value of the hex-encoded redemption script.
     * }
     *
     * @param {number} nrequired
     * @param {string[]} keys
     * @param {string} account
     * @returns {Promise<any>}
     */
    addMultiSigAddress(nrequired, keys, account) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = [nrequired, keys, account];
            this.log.debug('params: ', params);
            return yield this.call('addmultisigaddress', params);
        });
    }
    /**
     * ﻿Create a transaction spending the given inputs and creating new outputs.
     * Outputs can be addresses or data.
     * Returns hex-encoded raw transaction.
     * Note that the transaction's inputs are not signed, and
     * it is not stored in the wallet or transmitted to the network.
     *
     * @param {"resources".Output[]} inputs
     * @param outputs
     * @returns {Promise<any>}
     */
    createRawTransaction(inputs, outputs) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.call('createrawtransaction', [inputs, outputs]);
        });
    }
    /**
     * ﻿Sign inputs for raw transaction (serialized, hex-encoded)
     *
     * @param {string} hexstring
     * @param {any[]} outputs
     * @returns {Promise<any>}
     */
    signRawTransactionWithWallet(hexstring, outputs) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = [];
            params.push(hexstring);
            if (outputs) {
                params.push(outputs);
            }
            return yield this.call('signrawtransactionwithwallet', params);
        });
    }
    /**
     * ﻿Sign inputs for raw transaction (serialized, hex-encoded)
     *
     * @param {string} hexstring
     * @param {string[]} privkeys
     * @param prevtxs
     * @param sighashtype
     * @returns {Promise<any>}
     */
    signRawTransactionWithKey(hexstring, privkeys, prevtxs, sighashtype) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = [hexstring, privkeys];
            if (prevtxs) {
                params.push(prevtxs);
            }
            if (sighashtype) {
                params.push(sighashtype);
            }
            return yield this.call('signrawtransactionwithkey', params);
        });
    }
    /**
     * Sign inputs for raw transaction (serialized, hex-encoded)
     *
     * @param {string} hexstring
     * @param {any[]} outputs
     * @returns {Promise<any>}
     */
    signRawTransaction(hexstring, outputs) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = [];
            params.push(hexstring);
            if (outputs) {
                params.push(outputs);
            }
            return yield this.call('signrawtransaction', params);
        });
    }
    /**
     * Submits raw transaction (serialized, hex-encoded) to local node and network.
     *
     * @param {string} hexstring
     * @returns {Promise<any>}
     */
    sendRawTransaction(hexstring, allowHighFees = false) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = [];
            params.push(hexstring);
            params.push(allowHighFees);
            return yield this.call('sendrawtransaction', params);
        });
    }
    /**
     * Return a JSON object representing the serialized, hex-encoded transaction.
     *
     * @param {string} hexstring
     * @returns {Promise<any>}
     */
    decodeRawTransaction(hexstring, isWitness) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = [];
            params.push(hexstring);
            if (isWitness !== undefined) {
                params.push(isWitness);
            }
            return yield this.call('decoderawtransaction', params);
        });
    }
    /**
     * Return the raw transaction data.
     *
     * @param {string} hexstring
     * @returns {Promise<any>}
     */
    getRawTransaction(txid, verbose, blockhash) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = [];
            params.push(txid);
            if (verbose !== undefined) {
                params.push(verbose);
            }
            if (blockhash !== undefined) {
                params.push(blockhash);
            }
            return yield this.call('getrawtransaction', params);
        });
    }
    /**
     * ﻿Returns array of unspent transaction outputs
     * with between minconf and maxconf (inclusive) confirmations.
     * Optionally filter to only include txouts paid to specified addresses.
     *
     * @param {number} minconf
     * @param {number} maxconf
     * @param {string[]} addresses
     * @param {boolean} includeUnsafe
     * @param queryOptions
     * @returns {Promise<any>}
     */
    listUnspent(minconf, maxconf, addresses = [], includeUnsafe = true, queryOptions = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = [minconf, maxconf, addresses, includeUnsafe];
            if (!_.isEmpty(queryOptions)) {
                params.push(queryOptions);
            }
            return yield this.call('listunspent', params);
        });
    }
    /**
     * ﻿DEPRECATED. Returns the current Particl address for receiving payments to this account.
     *
     * @param {string} account
     * @returns {Promise<any>}
     */
    getAccountAddress(account) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = [account];
            return yield this.call('getaccountaddress', params);
        });
    }
    /**
     * ﻿Reveals the private key corresponding to 'address'.
     *
     * @param {string} address
     * @returns {Promise<string>}
     */
    dumpPrivKey(address) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = [address];
            return yield this.call('dumpprivkey', params);
        });
    }
    /**
     * ﻿Return information about the given particl address.
     *
     * @param {string} address
     * @returns {Promise<string>}
     */
    validateAddress(address) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = [address];
            return yield this.call('validateaddress', params);
        });
    }
    call(method, params = [], logCall = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const id = RPC_REQUEST_ID++;
            const postData = JSON.stringify({
                jsonrpc: '2.0',
                method,
                params,
                id
            });
            const url = this.getUrl();
            const options = this.getOptions();
            if (logCall) {
                this.log.debug('call: ' + method + ' ' + params.toString().replace(new RegExp(',', 'g'), ' '));
            }
            // this.log.debug('call url:', url);
            // this.log.debug('call postData:', postData);
            return yield WebRequest.post(url, options, postData)
                .then(response => {
                if (response.statusCode !== 200) {
                    this.log.debug('response.headers: ', response.headers);
                    this.log.debug('response.statusCode: ', response.statusCode);
                    this.log.debug('response.statusMessage: ', response.statusMessage);
                    this.log.debug('response.content: ', response.content);
                    throw new HttpException_1.HttpException(response.statusCode, response.statusMessage);
                }
                const jsonRpcResponse = JSON.parse(response.content);
                if (jsonRpcResponse.error) {
                    throw new InternalServerException_1.InternalServerException([jsonRpcResponse.error.code, jsonRpcResponse.error.message]);
                }
                // this.log.debug('RESULT:', jsonRpcResponse.result);
                return jsonRpcResponse.result;
            })
                .catch(error => {
                this.log.error('ERROR: ' + error.name + ': ' + error.message);
                if (error instanceof HttpException_1.HttpException || error instanceof InternalServerException_1.InternalServerException) {
                    throw error;
                }
                else {
                    throw new InternalServerException_1.InternalServerException([error.name, error.message]);
                }
            });
        });
    }
    getOptions() {
        const auth = {
            user: (process.env.RPCUSER ? process.env.RPCUSER : this.coreCookieService.getCoreRpcUsername()),
            pass: (process.env.RPCPASSWORD ? process.env.RPCPASSWORD : this.coreCookieService.getCoreRpcPassword()),
            sendImmediately: false
        };
        const headers = {
            'User-Agent': 'Marketplace RPC client',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        const rpcOpts = {
            auth,
            headers
        };
        // this.log.debug('initializing rpc with opts:', rpcOpts);
        return rpcOpts;
    }
    getUrl() {
        const host = (process.env.RPCHOSTNAME ? process.env.RPCHOSTNAME : this.DEFAULT_HOSTNAME);
        const port = (Environment_1.Environment.isDevelopment() || Environment_1.Environment.isTest() ?
            (process.env.TESTNET_PORT ? process.env.TESTNET_PORT : this.DEFAULT_TESTNET_PORT) :
            (process.env.MAINNET_PORT ? process.env.MAINNET_PORT : this.DEFAULT_MAINNET_PORT));
        return 'http://' + host + ':' + port;
    }
};
CoreRpcService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.CoreCookieService)),
    tslib_1.__metadata("design:paramtypes", [Object, CoreCookieService_1.CoreCookieService])
], CoreRpcService);
exports.CoreRpcService = CoreRpcService;
//# sourceMappingURL=CoreRpcService.js.map