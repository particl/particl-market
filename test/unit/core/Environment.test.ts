// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Environment } from '../../../src/core/helpers/Environment';


describe('Environment', () => {
    test('getName() should return the test env', () => {
        expect(Environment.getNodeEnv()).toBe('test');
    });

    test('isTest() should be true', () => {
        expect(Environment.isTest()).toBeTruthy();
    });

    test('isDevelopment() should be false', () => {
        expect(Environment.isDevelopment()).toBeFalsy();
    });

    test('isProduction() should be false', () => {
        expect(Environment.isProduction()).toBeFalsy();
    });
});
