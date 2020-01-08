// Copyright (c) 2017-2020, The Particl Market developers
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
import { CoreCookieService } from './observer/CoreCookieService';
import { Rpc } from 'omp-lib';
import { RpcAddressBalance, RpcAddressInfo, RpcBlindSendToOutput, RpcBlockchainInfo, RpcExtKeyGenesisImport, RpcMnemonic, RpcNetworkInfo, RpcRawTx,
    RpcUnspentOutput, RpcWallet, RpcWalletDir, RpcWalletInfo, RpcExtKey, RpcExtKeyResult } from 'omp-lib/dist/interfaces/rpc';
import { BlindPrevout, CryptoAddress, CryptoAddressType, OutputType, Prevout } from 'omp-lib/dist/interfaces/crypto';
import { fromSatoshis } from 'omp-lib/dist/util';
import { CtRpc } from 'omp-lib/dist/abstract/rpc';


decorate(injectable(), Rpc);
// TODO: refactor omp-lib CtRpc/Rpc
export class CoreRpcService extends CtRpc {

    public log: LoggerType;

    private RPC_REQUEST_ID = 1;

    private DEFAULT_MAINNET_PORT = 51735;
    private DEFAULT_TESTNET_PORT = 51935;
    private DEFAULT_REGTEST_PORT = 19792;
    private DEFAULT_HOSTNAME = 'localhost';
    // DEFAULT_USERNAME & DEFAULT_PASSWORD in CoreCookieService

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.observer.CoreCookieService) private coreCookieService: CoreCookieService
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

/*
    public async hasWallet(): Promise<boolean> {
        return await this.getWalletInfo()
            .then(response => {
                // the Hash160 of the HD account pubkey (only present when HD is enabled)
                return response.hdseedid !== undefined;
            })
            .catch(error => {
                return false;
            });
    }

    public get currentWallet(): string {
        return this.activeWallet;
    }

    public async setActiveWallet(wallet: string): Promise<void> {
        this.activeWallet = wallet;

        const walletLoaded = await this.walletLoaded(wallet);
        if (!walletLoaded) {
            await this.loadWallet(wallet);
        }
        await this.smsgSetWallet(wallet);
        this.log.debug('ACTIVE WALLET SET TO: ' + wallet);
    }
*/

    /**
     * Returns a list of loaded wallets.
     *
     * @returns {Promise<string>}
     */
    public async listLoadedWallets(): Promise<string[]> {
        return await this.call('listwallets');
    }

    /**
     * Returns a list of wallets in the wallet directory.
     *
     * @returns {Promise<RpcWalletDir>}
     */
    public async listWalletDir(): Promise<RpcWalletDir> {
        return await this.call('listwalletdir');
    }

    /**
     *
     * @param name
     * @returns {Promise<boolean>}
     */
    public async walletLoaded(name: string): Promise<boolean> {
        return await this.listLoadedWallets()
            .then(wallets => {
                const loaded = _.includes(wallets, name);
                this.log.debug('walletLoaded(): ', loaded);
                return loaded;
            });
    }

    /**
     *
     * @param name
     * @returns {Promise<boolean>}
     */
    public async walletExists(name: string): Promise<boolean> {
        return await this.listWalletDir()
            .then(result => {
                const found = _.find(result.wallets, wallet => {
                    return wallet.name === name;
                });
                const exists = found ? true : false;
                // this.log.debug('walletExists: ', exists);
                return exists;
            });
    }

    /**
     * Creates and loads a new wallet.
     *
     * @param name
     * @param disablePrivateKeys
     * @param blank
     */
    public async createWallet(name: string, disablePrivateKeys: boolean = false, blank: boolean = false): Promise<RpcWallet> {
        return await this.call('createwallet', [name, disablePrivateKeys, blank]);
    }

    /**
     *
     * @param name
     * @param disablePrivateKeys
     * @param blank
     */
    public async createAndLoadWallet(name: string, disablePrivateKeys: boolean = false, blank: boolean = false): Promise<RpcWallet> {
        return await this.createWallet(name, disablePrivateKeys, blank);
    }

    /**
     * Loads a wallet from a wallet file or directory.
     *
     * @param walletName
     */
    public async loadWallet(walletName: string): Promise<RpcWallet> {
        return await this.call('loadwallet', [walletName]);
    }

    /**
     * Loads wallets from a wallet file or directory unless they have already been loaded.
     *
     * @param walletNames
     */
    public async loadWallets(walletNames: string[]): Promise<string[]> {
        const loaded: string[] = [];
        for (const walletName of walletNames) {
            const isLoaded = await this.walletLoaded(walletName);
            if (!isLoaded) {
                const loadedWallet: RpcWallet = await this.loadWallet( walletName);
                loaded.push(loadedWallet.name);
            }
        }
        return loaded;
    }

    /**
     * Returns an object containing various wallet state info.
     * @param wallet
     */
    public async getWalletInfo(wallet: string): Promise<RpcWalletInfo> {
        return await this.call('getwalletinfo', [], wallet);
    }

    /**
     * Set secure messaging to use the specified wallet.
     * SMSG can only be enabled on one wallet.
     * Call with no parameters to unset the active wallet.
     *
     * @param walletName
     */
    public async smsgSetWallet(walletName: string): Promise<RpcWallet> {
        const result: RpcWallet = await this.call('smsgsetwallet', [walletName]);
        this.log.debug('smsgSetWallet(), result: ', JSON.stringify(result, null, 2));
        return result;
    }

    /**
     * mnemonic new|decode|addchecksum|dumpwords|listlanguages
     *          new ( "password" language nBytesEntropy bip44 )
     *              Generate a new extended key and mnemonic
     *          decode "password" "mnemonic" ( bip44 )
     *              Decode mnemonic
     *          addchecksum "mnemonic"
     *              Add checksum words to mnemonic
     *          mnemonic dumpwords ( "language" )
     *              Print list of words
     *          mnemonic listlanguages
     *              Print list of supported languages
     * @param params
     */
    public async mnemonic(params: any[] = []): Promise<RpcMnemonic> {
        return await this.call('mnemonic', params);
    }

    /**
     * extkey list (show_secrets)
     *
     * List loose and account ext keys.
     *
     * Arguments:
     * 1. show_secrets (boolean)
     *
     * @param wallet
     * @param showSecrets
     */
    public async extKeyList(wallet: string, showSecrets: boolean = true): Promise<RpcExtKey[]> {
        return await this.call('extkey', ['list', showSecrets], wallet);
    }

    /**
     * extkey import "key" ( "label" bip44 save_bip44_key )
     *
     * Add loose key to wallet.
     * If bip44 is set import will add the key derived from <key> on the bip44 path.
     * If save_bip44_key is set import will save the bip44 key to the wallet.
     *
     * @param wallet
     * @param key
     * @param label
     * @param saveBip44Key
     */
    public async extKeyImport(wallet: string, key: string, label: string, saveBip44Key: boolean = true): Promise<RpcExtKeyResult> {
        return await this.call('extkey', ['import', key, label, saveBip44Key], wallet);
    }

    /**
     * extkey info "key" ( "path" )
     * Return info for provided "key" or key at "path" from "key".
     *
     * @param wallet
     * @param key
     * @param path
     */
    public async extKeyInfo(wallet: string, key: string, path?: string): Promise<RpcExtKeyResult> {
        return await this.call('extkey', ['info', key, path], wallet);
    }

    /**
     * extkey setMaster "key/id"
     * Set a private ext key as current master key.
     * key can be a extkeyid or full key, but must be in the wallet.
     *
     * @param wallet
     * @param id
     */
    public async extKeySetMaster(wallet: string, id: string): Promise<RpcExtKeyResult> {
        return await this.call('extkey', ['setMaster', id], wallet);
    }

    /**
     * extkey deriveAccount ( "label" "path" )
     * Make a new account from the current master key, save to wallet.
     *
     * @param wallet
     * @param label
     */
    public async extKeyDeriveAccount(wallet: string, label: string): Promise<RpcExtKeyResult> {
        return await this.call('extkey', ['deriveAccount', label], wallet);
    }

    /**
     * extkey importAccount "key" ( time_scan_from "label" )
     * Add account key to wallet.
     * time_scan_from: N no check, Y-m-d date to start scanning the blockchain for owned txns.
     *
     * @param wallet
     * @param key
     */
    public async extKeyImportAccount(wallet: string, key: string): Promise<RpcExtKeyResult> {
        return await this.call('extkey', ['importAccount', key], wallet);
    }

    /**
     * extkey setDefaultAccount "id"
     * Set an account as the default.
     *
     * @param wallet
     * @param id
     */
    public async extKeySetDefaultAccount(wallet: string, id: string): Promise<RpcExtKeyResult> {
        return await this.call('extkey', ['setDefaultAccount', id], wallet);
    }

    /**
     * extkeyaltversion "ext_key"
     *
     * Returns the provided ext_key encoded with alternate version bytes.
     * If the provided ext_key has a Bitcoin prefix the output will be encoded with a Particl prefix.
     * If the provided ext_key has a Particl prefix the output will be encoded with a Bitcoin prefix.
     *
     * Arguments:
     * 1. ext_key    (string, required)
     *
     * @param extKey
     */
    public async extKeyAltVersion(extKey: string): Promise<string> {
        return await this.call('extkeyaltversion', [extKey]);
    }

    /**
     * extkeygenesisimport "mnemonic/key" ( "passphrase" save_bip44_root "master_label" "account_label" scan_chain_from )
     *
     * Import master key from bip44 mnemonic root key and derive default account.
     * Derives an extra chain from path 444444 to receive imported coin.
     *
     * Arguments:
     * 1. mnemonic/key       (string, required) The mnemonic or root extended key.
     * 2. passphrase         (string, optional, default=) Passphrase when importing mnemonic.
     * 3. save_bip44_root    (boolean, optional, default=false) Save bip44 root key to wallet.
     * 4. master_label       (string, optional, default=Master Key) Label for master key.
     * 5. account_label      (string, optional, default=Default Account) Label for account.
     * 6. scan_chain_from    (numeric, optional, default=0) Scan for transactions in blocks after timestamp, negative number to skip.
     *
     * @param wallet
     * @param params
     */
    public async extKeyGenesisImport(wallet: string, params: any[] = []): Promise<RpcExtKeyGenesisImport> {
        return await this.call('extkeygenesisimport', params, wallet);
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
    public async getNetworkInfo(): Promise<RpcNetworkInfo> {
        return await this.call('getnetworkinfo', []);
    }

    /**
     * Returns an object containing various state info regarding blockchain processing.
     *
     * @returns {Promise<RpcBlockchainInfo>}
     */
    public async getBlockchainInfo(): Promise<RpcBlockchainInfo> {
        return await this.call('getblockchaininfo', []);
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
     * @param wallet
     * @param addresses
     */
    public async getAddressBalance(addresses: string[]): Promise<RpcAddressBalance> {
        return await this.call('getaddressbalance', [{
            addresses
        }]);
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
     * @param wallet
     * @param minconf
     * @param includeEmpty
     * @param includeWatchOnly
     * @param addressFilter
     */
    public async listReceivedByAddress(wallet: string, minconf: number = 3, includeEmpty: boolean = false, includeWatchOnly: boolean = false,
                                       addressFilter?: string): Promise<any> {
        if (addressFilter) {
            return await this.call('listreceivedbyaddress', [minconf, includeEmpty, includeWatchOnly, addressFilter], wallet);
        } else {
            return await this.call('listreceivedbyaddress', [minconf, includeEmpty, includeWatchOnly], wallet);
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
     * @param wallet
     * @param {any[]} params
     * @param {boolean} smsgAddress
     * @returns {Promise<string>}
     */
    public async getNewAddress(wallet: string, params: any[] = [], smsgAddress: boolean = true): Promise<string> {
        const address = await this.call('getnewaddress', params, wallet);

        if (smsgAddress) {
            // call﻿smsgaddlocaladdress, even though I'm not sure if its required
            const addLocalAddressResponse = await this.call('smsgaddlocaladdress', [address], wallet);
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
     * @param wallet
     * @param {any[]} params
     * @returns {Promise<string>}
     */
    public async getNewStealthAddress(wallet: string, params: any[] = []): Promise<CryptoAddress> {
        const sx = await this.call('getnewstealthaddress', params, wallet);
        return {
            type: CryptoAddressType.STEALTH,
            address: sx
        } as CryptoAddress;
    }

/*
    public async getBlindPrevouts(type: string, satoshis: number, blind?: string): Promise<BlindPrevout[]> {
        // todo: create an enum for the outputtype
        this.log.debug('getBlindPrevouts(), type: ' + type + ', satoshis: ' + satoshis + ', blind: ' + blind);
        return [await this.createBlindPrevoutFrom(type, satoshis, blind)];
    }
*/
    public async getPrevouts(wallet: string, typeIn: OutputType, typeOut: OutputType, satoshis: number, blind?: string): Promise<BlindPrevout[]> {
        // todo: create an enum for the outputtype
        this.log.debug('getPrevouts(), typeIn: ' + typeIn + ', typeIn: ' + typeOut + ', satoshis: ' + satoshis + ', blind: ' + blind);
        const prevOuts: BlindPrevout[] = [];
        const newPrevOut = await this.createPrevoutFrom(wallet, typeIn, typeOut, satoshis, blind);
        prevOuts.push(newPrevOut);
        return prevOuts;
    }

    /**
     * Verify value commitment.
     * note that the amount is satoshis, which differs from the rpc api
     *
     * @param wallet
     * @param commitment
     * @param blind
     * @param satoshis
     */
    public async verifyCommitment(wallet: string, commitment: string, blind: string, satoshis: number): Promise<boolean> {
        return (await this.call('verifycommitment', [commitment, blind, fromSatoshis(satoshis)], wallet)).result;
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
     * @param wallet
     * @param {string} address
     * @returns {Promise<any>}
     */
    public async getAddressInfo(wallet: string, address: string): Promise<RpcAddressInfo> {
        return await this.call('getaddressinfo', [address], wallet);
    }

    /**
     *
     * @param wallet
     * @param address
     */
    public async isAddressMine(wallet: string, address: string): Promise<boolean> {
        const checkAddress: RpcAddressInfo = await this.getAddressInfo(wallet, address);
        return (checkAddress && checkAddress.ismine);
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
     * @param wallet
     * @param {number} nrequired
     * @param {string[]} keys
     * @param {string} account
     * @returns {Promise<any>}
     */
    public async addMultiSigAddress(wallet: string, nrequired: number, keys: string[], account?: string): Promise<any> {
        const params: any[] = [];
        params.push(nrequired);
        params.push(keys);
        if (account) {
            params.push(account);
        }
        this.log.debug('params: ', params);
        return await this.call('addmultisigaddress', params, wallet);
    }

    /**
     * ﻿Create a transaction spending the given inputs and creating new outputs.
     * Outputs can be addresses or data.
     * Returns hex-encoded raw transaction.
     * Note that the transaction's inputs are not signed, and
     * it is not stored in the wallet or transmitted to the network.
     *
     * @param wallet
     * @param inputs
     * @param outputs
     * @returns {Promise<any>}
     */
    public async createRawTransaction(wallet: string, inputs: BlindPrevout[], outputs: any[]): Promise<any> {
        return await this.call('createrawtransaction', [inputs, outputs], wallet);
    }

    /**
     * ﻿Sign inputs for raw transaction (serialized, hex-encoded)
     *
     * @param wallet
     * @param {string} hexstring
     * @param {any[]} outputs
     * @returns {Promise<any>}
     */
    public async signRawTransactionWithWallet(wallet: string, hexstring: string, outputs?: any[]): Promise<any> {
        const params: any[] = [];
        params.push(hexstring);
        if (outputs) {
            params.push(outputs);
        }
        return await this.call('signrawtransactionwithwallet', params, wallet);
    }

    /**
     * Create a signature for a raw transaction for a particular prevout & address (serialized, hex-encoded)
     *
     * @param wallet
     * @param {string} hex
     * @param {RpcUnspentOutput} prevtx
     * @param {string} address
     * @returns {Promise<string>} hex encoded signature
     */
    public async createSignatureWithWallet(wallet: string, hex: string, prevtx: RpcUnspentOutput, address: string): Promise<string> {
        return await this.call('createsignaturewithwallet', [hex, prevtx, address], wallet);
    }

    /**
     * Imports an address into the wallets
     *
     * @param wallet
     * @param {string} address the address to import
     * @param {string} label the label to assign the address
     * @param {boolean} rescan should the wallet rescan the blockchain for the transactions to this address
     * @param {boolean} p2sh should the address be a p2sh address
     * @returns {Promise<void>} returns nothing
     */
    public async importAddress(wallet: string, address: string, label: string, rescan: boolean, p2sh: boolean): Promise<void> {
        await this.call('importaddress', [address, label, rescan, p2sh], wallet);
    }

    /**
     * Send a certain amount to an address.
     *
     * @param wallet
     * @param {string} address the address to send coins to
     * @param {number} amount the amount of coins to transfer (NOT in satoshis!)
     * @param {string} comment the comment to attach to the wallet transaction
     * @returns {Promise<string>} returns the transaction id
     */
    public async sendToAddress(wallet: string, address: string, amount: number, comment: string): Promise<string> {
        return await this.call('sendtoaddress', [address, amount, comment], wallet);
    }


    /**
     * Send part to multiple outputs.
     *
     * @param wallet
     * @param typeIn        (OutputType, required) part/blind/anon
     * @param typeOut       (OutputType, required) part/blind/anon
     * @param outputs       (json array, required) A json array of json objects
     */
    public async sendTypeTo(wallet: string, typeIn: OutputType, typeOut: OutputType, outputs: RpcBlindSendToOutput[]): Promise<string> {
        const txid =  await this.call('sendtypeto', [typeIn.toString().toLowerCase(), typeOut.toString().toLowerCase(), outputs], wallet);
        this.log.debug('txid: ', txid);
        return txid;
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
    public async getRawTransaction(txid: string, verbose: boolean = true, blockhash?: string): Promise<RpcRawTx> {
        const params: any[] = [];
        params.push(txid);
        params.push(verbose);

        if (blockhash !== undefined) {
            params.push(blockhash);
        }
        return await this.call('getrawtransaction', params);
    }

    /**
     * Verify inputs for raw transaction (serialized, hex-encoded).
     * @param params
     */
    public async verifyRawTransaction(params: any[] = []): Promise<any> {
        return await this.call('verifyrawtransaction', params);
    }

    /**
     * ﻿Returns array of unspent transaction outputs
     * with between minconf and maxconf (inclusive) confirmations.
     * Optionally filter to only include txouts paid to specified addresses.
     *
     * @param wallet
     * @param type
     * @param {number} minconf
     * @param {number} maxconf
     * @returns {Promise<any>}
     */
    public async listUnspent(wallet: string, type: OutputType, minconf: number = 1, maxconf: number = 9999999
                             /*, addresses: string[] = [], includeUnsafe: boolean = true,
                             queryOptions: any = {}*/): Promise<RpcUnspentOutput[]> {
        const params: any[] = [minconf, maxconf]; // , addresses, includeUnsafe];

        switch (type) {
            case OutputType.ANON:
                return await this.call('listunspentanon', params, wallet);
            case OutputType.BLIND:
                return await this.call('listunspentblind', params, wallet);
            case OutputType.PART:
                return await this.call('listunspent', params, wallet);
            default:
                throw Error('Invalid Output type.');
        }

        // if (!_.isEmpty(queryOptions)) {
        //    params.push(queryOptions);
        // }
    }

    /**
     * Permanently locks outputs until unlocked or spent.
     *
     * @param wallet
     * @param unlock
     * @param prevouts
     * @param permanent
     * @returns {Promise<boolean>}
     */
    public async lockUnspent(wallet: string, unlock: boolean, prevouts: Prevout[], permanent: boolean): Promise<boolean> {
        return await this.call('lockunspent', [unlock, prevouts, permanent], wallet);
    }

    /**
     * ﻿Get the current block number
     *
     * @returns {Promise<number>}
     */
    public async getBlockCount(): Promise<number> {
        return await this.call('getblockcount', []);
    }

    /**
     * ﻿Reveals the private key corresponding to 'address'.
     *
     * @param wallet
     * @param {string} address
     * @returns {Promise<string>}
     */
    public async dumpPrivKey(wallet: string, address: string): Promise<string> {
        const params: any[] = [address];
        return await this.call('dumpprivkey', params, wallet);
    }

    /**
     * Sign an object.
     *
     * @param wallet
     * @param {string} address
     * @param {any} message
     * @returns {Promise<string>}
     */
    public async signMessage(wallet: string, address: string, message: any): Promise<string> {
        const signableMessage = JSON.stringify(message).split('').sort().toString();
        return await this.call('signmessage', [address, signableMessage], wallet);
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
     * @param wallet
     * @param logCall
     * @returns {Promise<any>}
     */
    public async call(method: string, params: any[] = [], wallet?: string, logCall: boolean = true): Promise<any> {

        const id = this.RPC_REQUEST_ID++;
        const postData = JSON.stringify({
            jsonrpc: '2.0',
            method,
            params,
            id
        });

        const url = this.getUrl(wallet);
        const options = this.getOptions();

        if (logCall) {
            // TODO: handle [object Object]
            this.log.debug('call: ' + method + ' ' + JSON.stringify(params).replace(new RegExp(',', 'g'), ' '));
        }

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

        return rpcOpts;
    }

    private getUrl(wallet: string | undefined): string {
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

        const url = 'http://' + host + ':' + port;
        if (wallet === undefined) {
            return url;
        } else {
            return url + '/wallet/' + wallet;
        }
    }

}
