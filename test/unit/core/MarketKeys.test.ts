// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { PublicKey, PrivateKey, Networks } from 'particl-bitcore-lib';

describe('MarketKeys', () => {

    const network = Networks.testnet;

    const NON_BASE58 = 'INVALID';
    const BASE58 = 'iNVALiD';
    const VALID_WIF = '7p1RiFvAGcmpwd4H18NnTS5aWc9bVfFfwShrrv9fwSYz3orJ3Y7c';
    const PUBLIC_DER = '030d67cf7159fe70bfcab3da441cd8c4ba338d6ea4052c0615893f440cf6b363c6';
    const ADDRESS = 'ppCCuPJqEUZ1Z1c4W5bsPoQrt1R7JVy7qQ';

    test('should fail to get PrivateKey from invalid wif', async () => {
        try {
            PrivateKey.fromWIF(NON_BASE58);
        } catch (e) {
            expect(e.message).toEqual('Non-base58 character');
        }
    });

    test('should fail to get PrivateKey from invalid wif', async () => {
        try {
            PrivateKey.fromWIF(BASE58);
        } catch (e) {
            expect(e.message).toEqual('Checksum mismatch');
        }
        // publishAddress = PrivateKey.fromWIF('INVALID').toPublicKey().toAddress(network).toString();
    });

    test('should get PrivateKey from valid wif', async () => {
        const privateKey: PrivateKey = PrivateKey.fromWIF(VALID_WIF);
        const address = privateKey.toPublicKey().toAddress(network).toString();
        expect(address).toEqual(ADDRESS);
    });

    test('should fail to get PublicKey from invalid der format public key', async () => {
        try {
            PublicKey.fromString(NON_BASE58);
        } catch (e) {
            expect(e.message).toEqual('Invalid DER format public key');
        }
    });

    test('should get PublicKey from PrivateKey', async () => {
        const privateKey: PrivateKey = PrivateKey.fromWIF(VALID_WIF);
        const publicKey: PublicKey = PublicKey(privateKey, true);
        const address = publicKey.toAddress(network).toString();
        expect(address).toEqual(ADDRESS);
    });

    test('should get PublicKey from der hex string', async () => {
        const privateKey: PrivateKey = PrivateKey.fromWIF(VALID_WIF);
        const publicKey: PublicKey = PublicKey.fromString(PUBLIC_DER);
        const address = publicKey.toAddress(network).toString();
        expect(address).toEqual(ADDRESS);
        expect(privateKey.toPublicKey().toAddress(network).toString()).toEqual(ADDRESS);
    });

});
