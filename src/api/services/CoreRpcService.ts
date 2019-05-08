// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as WebRequest from 'web-request';
import { inject, decorate, named, injectable } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { Environment } from '../../core/helpers/Environment';
import { HttpException } from '../exceptions/HttpException';
import { JsonRpc2Response } from '../../core/api/jsonrpc';
import { InternalServerException } from '../exceptions/InternalServerException';
import { CoreCookieService } from './CoreCookieService';
import { Rpc } from 'omp-lib';
import { RpcAddressInfo, RpcUnspentOutput} from 'omp-lib/dist/interfaces/rpc';
import { CtRpc, RpcBlindSendToOutput } from 'omp-lib/dist/abstract/rpc';
import { BlockchainInfo } from './CoreRpcService';
import { BlindPrevout, CryptoAddress, CryptoAddressType, Prevout } from 'omp-lib/dist/interfaces/crypto';
import { fromSatoshis } from 'omp-lib/dist/util';

declare function escape(s: string): string;
declare function unescape(s: string): string;

let RPC_REQUEST_ID = 1;

// TODO: refactor the omp-lib rpc stuff, this code is painfull to look at!!!
// TODO: create interfaces for results, and move them to separate files
export interface BlockchainInfo {
    chain: string;                      // current network name as defined in BIP70 (main, test, regtest)
    blocks: number;                     // the current number of blocks processed in the server
    headers: number;                    // the current number of headers we have validated
    bestblockhash: string;              // the hash of the currently best block
    moneysupply: number;                // the total amount of coin in the network
    blockindexsize: number;             // the total number of block headers indexed
    delayedblocks: number;              // the number of delayed blocks
    difficulty: number;                 // the current difficulty
    mediantime: number;                 // median time for the current best block
    verificationprogress: number;       // estimate of verification progress [0..1]
    initialblockdownload: boolean;      // estimate of whether this node is in Initial Block Download mode.
    chainwork: string;                  // total amount of work in active chain, in hexadecimal
    size_on_disk: number;               // the estimated size of the block and undo files on disk
    pruned: boolean;                    // if the blocks are subject to pruning
    // todo: add pruning and softfork related data when needed
}

decorate(injectable(), Rpc);
// TODO: refactor omp-lib CtRpc/Rpc
export class CoreRpcService extends Rpc { // CtRpc {

    public log: LoggerType;

    private DEFAULT_MAINNET_PORT = 51735;
    private DEFAULT_TESTNET_PORT = 51935;
    private DEFAULT_REGTEST_PORT = 19792;
    private DEFAULT_HOSTNAME = 'localhost';
    // DEFAULT_USERNAME & DEFAULT_PASSWORD in CoreCookieService

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.CoreCookieService) private coreCookieService: CoreCookieService
    ) {
        super();
        this.log = new Logger(__filename);
    }

    public async isConnected(): Promise<boolean> {
        return await this.getNetworkInfo()
            .then(response => true)
            .catch(error => {
                return false;
            });
    }

    public async hasWallet(): Promise<boolean> {
        return await this.getWalletInfo()
            .then(response => (response && response.hdseedid))
            .catch(error => {
                return false;
            });
    }

    /**
     * returns the particld version:
     * 16000400: 0.16.0.4,
     * 16000700: 0.16.0.7, ...
     *
     * @returns {Promise<number>}
     */
    public async getVersion(): Promise<number> {
        return await this.getNetworkInfo()
            .then(response => {
                return response.version;
            });
    }

    /**
     *
     */
    public async getNetworkInfo(): Promise<any> {
        return await this.call('getnetworkinfo', [], false);
    }

    /**
     *
     */
    public async getWalletInfo(): Promise<any> {
        return await this.call('getwalletinfo');
    }

    /**
     * Returns an object containing various state info regarding blockchain processing.
     *
     * @returns {Promise<BlockchainInfo>}
     */
    public async getBlockchainInfo(): Promise<BlockchainInfo> {
        return await this.call('getblockchaininfo', [], false);
    }

    /**
     * Returns the balance for an address(es) (requires addressindex to be enabled).
     *
     * Arguments:
     * {
     *   "addresses": [
     *     "address"  (string) The base58check encoded address
     *     ,...
     *   ]
     * }
     *
     * Result:
     * {
     *   "balance"   (string) The current balance in satoshis
     *   "received"  (string) The total number of satoshis received (including change)
     * }
     * @param addresses
     * @param logCall
     */
    public async getAddressBalance(addresses: string[], logCall: boolean = false): Promise<any> {
        return await this.call('getaddressbalance', [{
            addresses
        }], logCall);
    }

    /**
     * List balances by receiving address.
     *
     * example result:
     * [{
     *    "involvesWatchonly": true,      (bool)    Only returned if imported addresses were involved in transaction
     *    "address": "receivingaddress",  (string)  The receiving address
     *    "account": "accountname",       (string)  DEPRECATED. Backwards compatible alias for label.
     *    "amount": x.xxx,                (numeric) The total amount in PART received by the address
     *    "confirmations": n,             (numeric) The number of confirmations of the most recent transaction included
     *    "label": "label",               (string)  The label of the receiving address. The default label is "".
     *    "txids": [
     *       "txid",                      (string)  The ids of transactions received with the address
     *       ...
     *    ]
     *  }, ... ]
     *
     * @param minconf
     * @param includeEmpty
     * @param includeWatchOnly
     * @param addressFilter
     */
    public async listReceivedByAddress(minconf: number = 3, includeEmpty: boolean = false, includeWatchOnly: boolean = false,
                                       addressFilter?: string): Promise<any> {
        if (addressFilter) {
            return await this.call('listreceivedbyaddress', [minconf, includeEmpty, includeWatchOnly, addressFilter]);
        } else {
            return await this.call('listreceivedbyaddress', [minconf, includeEmpty, includeWatchOnly]);
        }
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
     * Result:
     * "address"                (string) The new particl address
     *
     * @param {any[]} params
     * @param {boolean} smsgAddress
     * @returns {Promise<string>}
     */
    public async getNewAddress(params: any[] = [], smsgAddress: boolean = true): Promise<string> {
        const address = await this.call('getnewaddress', params);

        if (smsgAddress) {
            // call﻿smsgaddlocaladdress, even though I'm not sure if its required
            const addLocalAddressResponse = await this.call('smsgaddlocaladdress', [address]);
            this.log.debug('addLocalAddressResponse: ', addLocalAddressResponse);

            // add address as receive address
            // const localKeyResponse = await this.call('smsglocalkeys', ['recv', '+', response]);
            // this.log.debug('localKeyResponse: ', localKeyResponse);
        }
        return address;
    }

    /**
     * ﻿Returns a new Particl stealth address for receiving payments.
     *
     * params:
     * ﻿[0] label                (string, optional, default=) If specified the key is added to the address book.
     * [1] num_prefix_bits      (numeric, optional, default=0)
     * [2] prefix_num           (numeric, optional, default=) If prefix_num is not specified the prefix will be
     *                          selected deterministically.
     *                          prefix_num can be specified in base2, 10 or 16, for base 2 prefix_num must
     *                          begin with 0b, 0x for base16.
     *                          A 32bit integer will be created from prefix_num and the least significant num_prefix_bits
     *                          will become the prefix.
     *                          A stealth address created without a prefix will scan all incoming stealth transactions,
     *                          irrespective of transaction prefixes.
     *                          Stealth addresses with prefixes will scan only incoming stealth transactions with
     *                          a matching prefix.
     * [3] bech32               (boolean, optional, default=false) Use Bech32 encoding.
     * [4] makeV2               (boolean, optional, default=false) Generate an address from the same scheme used
     *                          for hardware wallets.
     *
     * Result:
     * "address"                (string) The new particl stealth address
     *
     * @param {any[]} params
     * @returns {Promise<string>}
     */
    public async getNewStealthAddress(params: any[] = []): Promise<CryptoAddress> {
        const sx = await this.call('getnewstealthaddress', params);
        return {
            type: CryptoAddressType.STEALTH,
            address: sx
        } as CryptoAddress;
    }
/*
CtRpc
    public async getBlindPrevouts(satoshis: number, blind?: string): Promise<BlindPrevout[]> {
        return [await this.createBlindPrevoutFromAnon(satoshis, blind)];
    }
*/
    /**
     * Verify value commitment.
     * note that the amount is satoshis, which differs from the rpc api
     *
     * @param commitment
     * @param blind
     * @param satoshis
     */
    public async verifyCommitment(commitment: string, blind: string, satoshis: number): Promise<boolean> {
        return (await this.call('verifycommitment', [commitment, blind, fromSatoshis(satoshis)])).result;
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
    public async getAddressInfo(address: string): Promise<RpcAddressInfo> {
        return await this.call('getaddressinfo', [address]);
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
    public async addMultiSigAddress(nrequired: number, keys: string[], account?: string): Promise<any> {
        const params: any[] = [];
        params.push(nrequired);
        params.push(keys);
        if (account) {
            params.push(account);
        }
        this.log.debug('params: ', params);
        return await this.call('addmultisigaddress', params);
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
    public async createRawTransaction(inputs: BlindPrevout[], outputs: any[]): Promise<any> {
        return await this.call('createrawtransaction', [inputs, outputs]);
    }

    /**
     * ﻿Sign inputs for raw transaction (serialized, hex-encoded)
     *
     * @param {string} hexstring
     * @param {any[]} outputs
     * @returns {Promise<any>}
     */
    public async signRawTransactionWithWallet(hexstring: string, outputs?: any[]): Promise<any> {
        const params: any[] = [];
        params.push(hexstring);
        if (outputs) {
            params.push(outputs);
        }
        return await this.call('signrawtransactionwithwallet', params);
    }

    /**
     * Create a signature for a raw transaction for a particular prevout & address (serialized, hex-encoded)
     *
     * @param {string} hex
     * @param {RpcUnspentOutput} prevtx
     * @param {string} address
     * @returns {Promise<string>} hex encoded signature
     */
    public async createSignatureWithWallet(hex: string, prevtx: RpcUnspentOutput, address: string): Promise<string> {
        return await this.call('createsignaturewithwallet', [hex, prevtx, address]);
    }

    /**
     * Imports an address into the wallets
     *
     * @param {string} address the address to import
     * @param {string} label the label to assign the address
     * @param {boolean} rescan should the wallet rescan the blockchain for the transactions to this address
     * @param {boolean} p2sh should the address be a p2sh address
     * @returns {Promise<void>} returns nothing
     */
    public async importAddress(address: string, label: string, rescan: boolean, p2sh: boolean): Promise<void> {
        await this.call('importaddress', [address, label, rescan, p2sh]);
    }

    /**
     * Send a certain amount to an address.
     *
     * @param {string} address the address to send coins to
     * @param {number} amount the amount of coins to transfer (NOT in satoshis!)
     * @param {string} comment the comment to attach to the wallet transaction
     * @returns {Promise<string>} returns the transaction id
     */
    public async sendToAddress(address: string, amount: number, comment: string): Promise<string> {
        return await this.call('sendtoaddress', [address, amount, comment]);
    }


    /**
     * Send part to multiple outputs.
     *
     * @param typeIn        (string, required) part/blind/anon
     * @param typeOut       (string, required) part/blind/anon
     * @param outputs       (json array, required) A json array of json objects
     */
    public async sendTypeTo(typeIn: string, typeOut: string, outputs: RpcBlindSendToOutput[]): Promise<string> {
        return await this.call('sendtypeto', [typeIn, typeOut, outputs]);
    }

    /**
     * ﻿combinerawtransaction ["hexstring",...]
     *
     * Combine multiple partially signed transactions into one transaction.
     * The combined transaction may be another partially signed transaction or a fully signed transaction
     *
     * @param hexstrings
     * @returns {Promise<any>}
     */
    public async combineRawTransaction(hexstrings: string[]): Promise<any> {
        return await this.call('combinerawtransaction', [hexstrings]);
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
    public async signRawTransactionWithKey(hexstring: string, privkeys: string[], prevtxs?: any, sighashtype?: any): Promise<any> {
        const params: any[] = [hexstring, privkeys];
        if (prevtxs) {
            params.push(prevtxs);
        }
        if (sighashtype) {
            params.push(sighashtype);
        }

        return await this.call('signrawtransactionwithkey', params);
    }

    /**
     * Sign inputs for raw transaction (serialized, hex-encoded)
     *
     * @param {string} hexstring
     * @param {any[]} outputs
     * @returns {Promise<any>}
     */
    public async signRawTransaction(hexstring: string, outputs?: any[]): Promise<any> {
        const params: any[] = [];
        params.push(hexstring);
        if (outputs) {
            params.push(outputs);
        }
        return await this.call('signrawtransaction', params);
    }

    /**
     * Submits raw transaction (serialized, hex-encoded) to local node and network.
     *
     * @param {string} hex the raw transaction in hex format.
     * @param allowHighFees
     * @returns {Promise<any>}
     */
    public async sendRawTransaction(hex: string, allowHighFees: boolean = false): Promise<string> {
        const params: any[] = [];
        params.push(hex);
        params.push(allowHighFees);
        return await this.call('sendrawtransaction', params);
    }

    /**
     * Return a JSON object representing the serialized, hex-encoded transaction.
     *
     * @param {string} hexstring
     * @param isWitness
     * @returns {Promise<any>}
     */
    public async decodeRawTransaction(hexstring: string, isWitness?: boolean): Promise<any> {
        const params: any[] = [];
        params.push(hexstring);

        if (isWitness !== undefined) {
            params.push(isWitness);
        }
        return await this.call('decoderawtransaction', params);
    }

    /**
     * Return the raw transaction data.
     *
     * @returns {Promise<any>}
     * @param txid
     * @param verbose
     * @param blockhash
     */
    public async getRawTransaction(txid: string, verbose: boolean = true, blockhash?: string): Promise<any> {
        const params: any[] = [];
        params.push(txid);
        params.push(verbose);

        if (blockhash !== undefined) {
            params.push(blockhash);
        }
        return await this.call('getrawtransaction', params);
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
    public async listUnspent(minconf: number = 1, maxconf: number = 9999999, addresses: string[] = [], includeUnsafe: boolean = true,
                             queryOptions: any = {}): Promise<RpcUnspentOutput[]> {

        const params: any[] = [minconf, maxconf, addresses, includeUnsafe];
        if (!_.isEmpty(queryOptions)) {
            params.push(queryOptions);
        }
        return await this.call('listunspent', params);
    }

    /**
     *
     * @param minconf
     * @param maxconf
     * @param addresses
     * @param includeUnsafe
     * @param queryOptions
     * @returns {Promise<any>}
     */
    public async listUnspentBlind(minconf: number = 1, maxconf: number = 9999999, addresses: string[] = [], includeUnsafe: boolean = true,
                                  queryOptions: any = {}): Promise<RpcUnspentOutput[]> {

        const params: any[] = [minconf, maxconf, addresses, includeUnsafe];
        if (!_.isEmpty(queryOptions)) {
            params.push(queryOptions);
        }
        return await this.call('listunspentblind', params);
    }

    /**
     *
     * @param {boolean} unlock
     * @param prevouts
     * @param permanent
     * @returns {Promise<any>}
     */
    public async lockUnspent(unlock: boolean, prevouts: Prevout[]/*RpcOutput[]*/, permanent: boolean = true): Promise<boolean> {

        const params: any[] = [unlock, prevouts, permanent];
        return await this.call('lockunspent', params);
    }

    /**
     * ﻿DEPRECATED. Returns the current Particl address for receiving payments to this account.
     *
     * @param {string} account
     * @returns {Promise<any>}
     */
    public async getAccountAddress(account: string): Promise<any> {
        const params: any[] = [account];
        return await this.call('getaccountaddress', params);
    }

    /**
     * ﻿Get the current block number
     *
     * @returns {Promise<any>}
     */
    public async getBlockCount(): Promise<number> {
        return await this.call('getblockcount', []);
    }

    /**
     * ﻿Reveals the private key corresponding to 'address'.
     *
     * @param {string} address
     * @returns {Promise<string>}
     */
    public async dumpPrivKey(address: string): Promise<string> {
        const params: any[] = [address];
        return await this.call('dumpprivkey', params);
    }

    /**
     * Sign an object.
     *
     * @param {string} address
     * @param {any} message
     * @returns {Promise<string>}
     */
    public async signMessage(address: string, message: any): Promise<string> {
        const signableMessage = JSON.stringify(message).split('').sort().toString();
        return await this.call('signmessage', [address, signableMessage]);
    }

    /**
     * Verify a signature on a message.
     *
     * @param {string} address
     * @param signature
     * @param {any} message
     * @returns {Promise<string>}
     */
    public async verifyMessage(address: string, signature: string, message: any): Promise<boolean> {
        const signableMessage = JSON.stringify(message).split('').sort().toString();
        return await this.call('verifymessage', [address, signature, signableMessage]);
    }

    /**
     *
     * @param method
     * @param params
     * @param logCall
     * @returns {Promise<any>}
     */
    public async call(method: string, params: any[] = [], logCall: boolean = true): Promise<any> {

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
            // TODO: handle [object Object]
            this.log.debug('call: ' + method + ' ' + JSON.stringify(params).replace(new RegExp(',', 'g'), ' '));
        }
        // this.log.debug('call url:', url);
        // this.log.debug('call postData:', postData);

        return await WebRequest.post(url, options, postData)
            .then( response => {

                if (response.statusCode !== 200) {
                    this.log.error('response.headers: ', response.headers);
                    this.log.error('response.statusCode: ', response.statusCode);
                    this.log.error('response.statusMessage: ', response.statusMessage);
                    this.log.error('response.content: ', response.content);
                    const message = response.content ? JSON.parse(response.content) : response.statusMessage;
                    throw new HttpException(response.statusCode, message);
                }

                const jsonRpcResponse = JSON.parse(response.content) as JsonRpc2Response;
                if (jsonRpcResponse.error) {
                    throw new InternalServerException([jsonRpcResponse.error.code, jsonRpcResponse.error.message]);
                }

                // this.log.debug('RESULT:', jsonRpcResponse.result);
                return jsonRpcResponse.result;
            })
            .catch(error => {
                // this.log.error('ERROR: ' + JSON.stringify(error));
                if (error instanceof HttpException || error instanceof InternalServerException) {
                    throw error;
                } else {
                    throw new InternalServerException([error.name, error.message]);
                }
            });

    }

    private getOptions(): any {

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

    private getUrl(): string {
        // this.log.debug('Environment.isTestnet():', Environment.isTestnet());
        // this.log.debug('Environment.isAlpha():', Environment.isAlpha());

        const host = (process.env.RPCHOSTNAME ? process.env.RPCHOSTNAME : this.DEFAULT_HOSTNAME);
        const port = process.env.RPC_PORT ?
            process.env.RPC_PORT :
            (Environment.isRegtest() ?
                (process.env.REGTEST_PORT ? process.env.REGTEST_PORT : this.DEFAULT_REGTEST_PORT) :
                (Environment.isTestnet() ?
                    (process.env.TESTNET_PORT ? process.env.TESTNET_PORT : this.DEFAULT_TESTNET_PORT) :
                    (process.env.MAINNET_PORT ? process.env.MAINNET_PORT : this.DEFAULT_MAINNET_PORT)
                )
            );
        const wallet = (process.env.WALLET ? `/wallet/${process.env.WALLET}` : '');
        return `http://${host}:${port}${wallet}`;
    }


}
