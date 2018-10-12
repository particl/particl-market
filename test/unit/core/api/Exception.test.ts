// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { Exception, isException } from '../../../../src/core/api/Exception';

describe('Exception', () => {
    test('Should have the correct properties', () => {
        const exception = new Exception(400, 'message', { success: false });
        expect(exception.code).toBe(400);
        expect(exception.message).toBe('message');
        expect(exception.body.success).toBe(false);
        expect(exception[isException]).toBeTruthy();
    });
    test('Should have the correct properties', () => {
        const exception = new Exception(400, 'message', { success: false });
        expect(exception.code).toBe(400);
        expect(exception.message).toBe('message');
        expect(exception.body.success).toBe(false);
        expect(exception[isException]).toBeTruthy();
    });
    test('Should return a string with the code, name and message of the exception', () => {
        const exception = new Exception(400, 'message', { success: false });
        expect(exception.toString()).toBe(`400 - Exception:message`);
    });
});
