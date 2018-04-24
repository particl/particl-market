import { Logger as LoggerType } from '../../core/Logger';
import { CoreCookieService } from './CoreCookieService';
import { Output } from 'resources';
export declare class CoreRpcService {
    Logger: typeof LoggerType;
    private coreCookieService;
    log: LoggerType;
    private DEFAULT_MAINNET_PORT;
    private DEFAULT_TESTNET_PORT;
    private DEFAULT_HOSTNAME;
    constructor(Logger: typeof LoggerType, coreCookieService: CoreCookieService);
    isConnected(): Promise<boolean>;
    getNetworkInfo(): Promise<any>;
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
    getNewAddress(params?: any[], smsgAddress?: boolean): Promise<any>;
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
    getAddressInfo(address: string): Promise<any>;
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
    addMultiSigAddress(nrequired: number, keys: string[], account: string): Promise<any>;
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
    createRawTransaction(inputs: Output[], outputs: any): Promise<any>;
    /**
     * ﻿Sign inputs for raw transaction (serialized, hex-encoded)
     *
     * @param {string} hexstring
     * @param {any[]} outputs
     * @returns {Promise<any>}
     */
    signRawTransactionWithWallet(hexstring: string, outputs?: any[]): Promise<any>;
    /**
     * ﻿Sign inputs for raw transaction (serialized, hex-encoded)
     *
     * @param {string} hexstring
     * @param {string[]} privkeys
     * @param prevtxs
     * @param sighashtype
     * @returns {Promise<any>}
     */
    signRawTransactionWithKey(hexstring: string, privkeys: string[], prevtxs?: any, sighashtype?: any): Promise<any>;
    /**
     * Sign inputs for raw transaction (serialized, hex-encoded)
     *
     * @param {string} hexstring
     * @param {any[]} outputs
     * @returns {Promise<any>}
     */
    signRawTransaction(hexstring: string, outputs?: any[]): Promise<any>;
    /**
     * Submits raw transaction (serialized, hex-encoded) to local node and network.
     *
     * @param {string} hexstring
     * @returns {Promise<any>}
     */
    sendRawTransaction(hexstring: string, allowHighFees?: boolean): Promise<any>;
    /**
     * Return a JSON object representing the serialized, hex-encoded transaction.
     *
     * @param {string} hexstring
     * @returns {Promise<any>}
     */
    decodeRawTransaction(hexstring: string, isWitness?: boolean): Promise<any>;
    /**
     * Return the raw transaction data.
     *
     * @param {string} hexstring
     * @returns {Promise<any>}
     */
    getRawTransaction(txid: string, verbose?: boolean, blockhash?: string): Promise<any>;
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
    listUnspent(minconf: number, maxconf: number, addresses?: string[], includeUnsafe?: boolean, queryOptions?: any): Promise<any>;
    /**
     * ﻿DEPRECATED. Returns the current Particl address for receiving payments to this account.
     *
     * @param {string} account
     * @returns {Promise<any>}
     */
    getAccountAddress(account: string): Promise<any>;
    /**
     * ﻿Reveals the private key corresponding to 'address'.
     *
     * @param {string} address
     * @returns {Promise<string>}
     */
    dumpPrivKey(address: string): Promise<string>;
    /**
     * ﻿Return information about the given particl address.
     *
     * @param {string} address
     * @returns {Promise<string>}
     */
    validateAddress(address: string): Promise<any>;
    call(method: string, params?: any[], logCall?: boolean): Promise<any>;
    private getOptions();
    private getUrl();
}
