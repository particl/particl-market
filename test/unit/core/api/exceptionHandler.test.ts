// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { exceptionHandler } from '../../../../src/core/api/exceptionHandler';
import { Exception } from '../../../../src/core/api/Exception';

describe('exceptionHandler', () => {

    let req;
    let res;
    let next;
    beforeEach(() => {
        req = {};
        res = {
            failed: jest.fn()
        };
        next = jest.fn();
    });

    test('Should fail, because it is a exception with the given error code and body', () => {
        const e = new Exception(400, 'message', { success: false });
        exceptionHandler(e, req, res, next);
        expect(res.failed).toHaveBeenCalledWith(400, 'message', { success: false });
    });

    test('Should fail, because it is a exception with the given error code', () => {
        const e = new Exception(400, 'message');
        exceptionHandler(e, req, res, next);
        expect(res.failed).toHaveBeenCalledWith(400, 'message', 'message');
    });

    test('Should fail, because it is a system error with 500', () => {
        const e = new Error('message');
        exceptionHandler(e, req, res, next);
        expect(res.failed).toHaveBeenCalledWith(500, 'Something broke!', null);
    });
});
